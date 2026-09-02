import bcrypt from 'bcryptjs';

export class PasswordUtil {
  public static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  public static async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
