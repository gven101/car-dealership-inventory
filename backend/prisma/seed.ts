import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@dealership.com';
  const password = process.env.ADMIN_PASSWORD ?? 'admin123';

  // upsert = create if missing, otherwise just make sure it's an admin
  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: { name: 'Admin', email, password: await bcrypt.hash(password, 10), role: 'ADMIN' },
  });

  if ((await prisma.vehicle.count()) === 0) {
    await prisma.vehicle.createMany({
      data: [
        { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
        { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 3 },
        { make: 'Ford', model: 'Mustang', category: 'Coupe', price: 45000, quantity: 0 },
        { make: 'Hyundai', model: 'Creta', category: 'SUV', price: 18000, quantity: 7 },
      ],
    });
  }
  console.log(`Seeded admin: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());