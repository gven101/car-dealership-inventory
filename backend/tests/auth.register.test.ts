import request from 'supertest';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';

const validUser = { name: 'Test User', email: 'test@example.com', password: 'secret123' };

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token without the password', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: validUser.name, email: validUser.email, role: 'USER' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('stores a hashed password, not plain text', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const user = await prisma.user.findUnique({ where: { email: validUser.email } });

    expect(user?.password).not.toBe(validUser.password);
  });

  it('ignores a role sent by the client', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, role: 'ADMIN' });

    expect(res.body.user.role).toBe('USER');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: validUser.email });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...validUser, password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when the email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });
});