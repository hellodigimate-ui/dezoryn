import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { Role } from '../constants/roles';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export class JwtUtil {
  public static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRATION,
    } as jwt.SignOptions);
  }

  public static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRATION,
    } as jwt.SignOptions);
  }

  public static verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  }

  public static verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  }
}
