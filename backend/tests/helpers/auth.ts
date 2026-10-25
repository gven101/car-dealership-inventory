import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../src/lib/prisma';
import { signToken } from '../../src/services/auth.service';

async function createUserWithToken(role: Role) {
  const user = await prisma.user.create({
    data: {
      name: `${role} user`,
      email: `${role.toLowerCase()}@example.com`,
      password: await bcrypt.hash('secret123', 4), // low cost = faster tests
      role,
    },
  });
  return signToken(user);
}

export const getUserToken = () => createUserWithToken('USER');
export const getAdminToken = () => createUserWithToken('ADMIN');