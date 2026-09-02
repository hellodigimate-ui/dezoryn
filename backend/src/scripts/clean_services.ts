import { prisma } from '../config/prisma.config';

async function main() {
  const count = await prisma.service.count();
  console.log('CURRENT SERVICES COUNT:', count);
  const deleted = await prisma.service.deleteMany({});
  console.log('PERMANENTLY DELETED SERVICES:', deleted.count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
