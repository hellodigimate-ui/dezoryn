import { prisma } from '../config/prisma.config';
import bcrypt from 'bcryptjs';

async function main() {
  const hash = await bcrypt.hash('dezoryn@2025', 10);
  await prisma.user.update({
    where: { email: 'dezoryntechnology@gmail.com' },
    data: { password: hash }
  });
  console.log('UPDATED ADMIN HASH TO 10 ROUNDS');
}

main().catch(console.error).finally(() => prisma.$disconnect());
