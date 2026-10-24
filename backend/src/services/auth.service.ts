import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const SALT_ROUNDS = 10;

export interface RegisterInput {
  name?: string;
  email?: string;
  password?: string;
}

/** User data that is safe to send to the client (no password). */
export function toPublicUser(user: User) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function signToken(user: User): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: '1d' });
}

function validateRegisterInput({ name, email, password }: RegisterInput) {
  if (!name || !email || !password) {
    throw new AppError(400, 'Name, email and password are required');
  }
  if (!EMAIL_REGEX.test(email)) throw new AppError(400, 'Invalid email');
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new AppError(400, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }
}

export async function register(input: RegisterInput) {
  validateRegisterInput(input);
  const { name, email, password } = input as Required<RegisterInput>;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(409, 'Email already registered');

  // Role is never read from input, so new users always default to USER
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });

  return { token: signToken(user), user: toPublicUser(user) };
}