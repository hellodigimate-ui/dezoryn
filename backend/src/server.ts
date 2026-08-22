import app from './app';
import { env } from './config/env.config';
import { prisma } from './config/prisma.config';
import { logger } from './utils/logger.util';
import { PasswordUtil } from './utils/password.util';
import { Role } from './constants/roles';

const PORT = env.PORT;

async function ensureDefaultAdmin() {
  try {
    const adminEmail = 'dezoryntechnology@gmail.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    const hashedPassword = await PasswordUtil.hash('dezoryn@2025');
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Dezoryn',
          lastName: 'Admin',
          role: Role.ADMIN,
          isActive: true,
        },
      });
      logger.info(`✅ Default Admin user auto-seeded: ${adminEmail}`);
    } else {
      const isMatch = await PasswordUtil.compare('dezoryn@2025', existingAdmin.password).catch(() => false);
      if (!isMatch || !existingAdmin.isActive || existingAdmin.role !== Role.ADMIN) {
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            password: hashedPassword,
            role: Role.ADMIN,
            isActive: true,
          },
        });
        logger.info(`✅ Default Admin user synchronized & active: ${adminEmail}`);
      }
    }
  } catch (err: any) {
    logger.warn(`⚠️ Auto-seed admin check: ${err?.message || err}`);
  }
}

async function bootstrap() {
  try {
    // Test Database Connection
    await prisma.$connect();
    logger.info('🐘 Connected successfully to PostgreSQL database via Prisma');

    await ensureDefaultAdmin();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Dezoryn CMS Backend API running on port ${PORT}`);
      logger.info(`📡 Health Check: http://localhost:${PORT}${env.API_PREFIX}/health`);
      logger.info(`🔐 Base API Endpoint: http://localhost:${PORT}${env.API_PREFIX}`);
    });

    // Graceful Shutdown Handler
    const shutdown = async (signal: string) => {
      logger.info(`⚠️ Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        logger.info('🛑 HTTP server closed.');
        await prisma.$disconnect();
        logger.info('🐘 Prisma client disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    process.on('unhandledRejection', (reason: Error) => {
      logger.error(`❌ Unhandled Rejection: ${reason.message}`);
      logger.error(reason.stack || 'No stack trace');
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error(`❌ Uncaught Exception: ${error.message}`);
      process.exit(1);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
