import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';

const user = { name: 'Test User', email: 'test@example.com', password: 'secret123' };

beforeEach(async () => {
  await resetDb();
  await request(app).post('/api/auth/register').send(user);
});
afterAll(() => prisma.$disconnect());

describe('POST /api/auth/login', () => {
  it('returns a valid token and the user for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ email: user.email, role: 'USER' });
    expect(res.body.user.password).toBeUndefined();

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as { id: string; role: string };
    expect(payload.id).toBe(res.body.user.id);
    expect(payload.role).toBe('USER');
  });

  it('returns 401 for a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 with the same message for an unknown email', async () => {
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrongpass' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: user.password });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPass.body.message);
  });

  it('returns 400 when email or password is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: user.email });
    expect(res.status).toBe(400);
  });
});