/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Role } from '../src/constants/roles';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default Admin user if not present
  const adminEmail = 'dezoryntechnology@gmail.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('dezoryn@2025', 12);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: 'Dezoryn',
        lastName: 'Admin',
        role: Role.ADMIN,
        isActive: true,
      },
    });
    console.log(`✅ Default Admin created: ${admin.email}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${existingAdmin.email}`);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
