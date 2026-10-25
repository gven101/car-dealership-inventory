import request from 'supertest';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';
import { testUser } from './helpers/fixtures';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token without the password', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: testUser.name, email: testUser.email, role: 'USER' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('stores a hashed password, not plain text', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const user = await prisma.user.findUnique({ where: { email: testUser.email } });

    expect(user?.password).not.toBe(testUser.password);
  });

  it('ignores a role sent by the client', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...testUser, role: 'ADMIN' });

    expect(res.body.user.role).toBe('USER');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: testUser.email });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid email', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...testUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when password is shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...testUser, password: '123' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when the email is already registered', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });
});