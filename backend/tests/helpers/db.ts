import { prisma } from '../../src/lib/prisma';

export async function resetDb() {
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}

export { prisma };