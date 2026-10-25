import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { authenticate, requireAdmin } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/errorHandler';

// A tiny app used only to test the middleware in isolation
const app = express();
app.get('/protected', authenticate, (_req, res) => { res.json({ ok: true }); });
app.get('/admin', authenticate, requireAdmin, (_req, res) => { res.json({ ok: true }); });
app.use(errorHandler);

const secret = () => process.env.JWT_SECRET as string;
const tokenFor = (role: 'USER' | 'ADMIN') => jwt.sign({ id: '1', role }, secret());

describe('authenticate', () => {
  it('returns 401 when no token is sent', async () => {
    const res = await request(app).get('/protected');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed header', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'NotBearer abc');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a token signed with the wrong secret', async () => {
    const bad = jwt.sign({ id: '1', role: 'USER' }, 'wrong-secret');
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${bad}`);
    expect(res.status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    const expired = jwt.sign({ id: '1', role: 'USER', exp: Math.floor(Date.now() / 1000) - 60 }, secret());
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${expired}`);
    expect(res.status).toBe(401);
  });

  it('allows a request with a valid token', async () => {
    const res = await request(app).get('/protected').set('Authorization', `Bearer ${tokenFor('USER')}`);
    expect(res.status).toBe(200);
  });
});

describe('requireAdmin', () => {
  it('returns 403 for a regular user', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${tokenFor('USER')}`);
    expect(res.status).toBe(403);
  });

  it('allows an admin', async () => {
    const res = await request(app).get('/admin').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
  });
});