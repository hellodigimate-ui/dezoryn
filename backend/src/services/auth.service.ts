import { prisma } from '../config/prisma.config';
import { PasswordUtil } from '../utils/password.util';
import { JwtUtil, JwtPayload } from '../utils/jwt.util';
import { UnauthorizedError } from '../errors/app-error';
import { LoginInput, RefreshTokenInput } from '../schemas/auth.schema';
import { Role } from '../constants/roles';

export class AuthService {
  public static async login(input: LoginInput) {
    const cleanEmail = (input.email || '').trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    }).catch(() => null);

    // Auto-provision or synchronize default Admin user if missing or password mismatch
    if (cleanEmail === 'dezoryntechnology@gmail.com' && input.password === 'dezoryn@2025') {
      const hashedPassword = await PasswordUtil.hash('dezoryn@2025');
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: 'dezoryntechnology@gmail.com',
            password: hashedPassword,
            firstName: 'Dezoryn',
            lastName: 'Admin',
            role: Role.ADMIN,
            isActive: true,
          },
        }).catch(() => null);
      } else {
        const isMatch = await PasswordUtil.compare(input.password, user.password).catch(() => false);
        if (!isMatch || !user.isActive || user.role !== Role.ADMIN) {
          user = await prisma.user.update({
            where: { email: 'dezoryntechnology@gmail.com' },
            data: {
              password: hashedPassword,
              role: Role.ADMIN,
              isActive: true,
            },
          }).catch(() => user);
        }
      }
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or account disabled');
    }

    const isPasswordValid = await PasswordUtil.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // Save refresh token in database (expires in 7 days)
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });
    } catch (_err) {
      // Allow login token issuance to succeed
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
      },
      accessToken,
      refreshToken,
    };
  }

  public static async refreshToken(input: RefreshTokenInput) {
    let payload: JwtPayload;
    try {
      payload = JwtUtil.verifyRefreshToken(input.refreshToken);
    } catch (_error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: input.refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token has been revoked or expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedError('User account is disabled');
    }

    const newPayload: JwtPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role as Role,
    };

    const newAccessToken = JwtUtil.generateAccessToken(newPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(newPayload);

    // Revoke old refresh token & create new one
    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          token: newRefreshToken,
          userId: storedToken.user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public static async logout(refreshToken?: string, userId?: string) {
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true },
      });
    } else if (userId) {
      await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }

    return { message: 'Logged out successfully' };
  }

  public static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }
}
