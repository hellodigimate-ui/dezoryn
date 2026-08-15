import { prisma } from '../config/prisma.config';
import { PasswordUtil } from '../utils/password.util';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app-error';
import { CreateUserInput, UpdateUserInput, ChangePasswordInput } from '../schemas/user.schema';
import { Role } from '../constants/roles';

export class UserService {
  public static async createUser(input: CreateUserInput) {
    const email = String(input.email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError(`User with email '${email}' already exists`);
    }

    const hashedPassword = await PasswordUtil.hash(input.password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role as Role,
        isActive: input.isActive,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  public static async getUsers(query: { page?: number; limit?: number; search?: string; role?: Role }) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          avatar: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    return user;
  }

  public static async updateUser(id: string, input: UpdateUserInput, _requestorRole: Role) {
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    const updateData: any = {};
    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.role !== undefined) updateData.role = input.role;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  public static async deleteUser(id: string, requestorId: string, _requestorRole: Role) {
    if (id === requestorId) {
      throw new BadRequestError('Cannot delete your own user account');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      throw new NotFoundError(`User with ID '${id}' not found`);
    }

    await prisma.user.delete({
      where: { id },
    });

    return { message: `User '${targetUser.email}' deleted successfully` };
  }

  public static async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isValidPassword = await PasswordUtil.compare(input.oldPassword, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Incorrect current password');
    }

    const newHashedPassword = await PasswordUtil.hash(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    // Revoke all refresh tokens on password change
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });

    return { message: 'Password updated successfully. Please log in again.' };
  }
}
