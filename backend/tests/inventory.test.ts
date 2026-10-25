import request from 'supertest';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';
import { getAdminToken, getUserToken } from './helpers/auth';

const car = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000 };
const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

let adminToken: string;
let userToken: string;

beforeEach(async () => {
  await resetDb();
  adminToken = await getAdminToken();
  userToken = await getUserToken();
});
afterAll(() => prisma.$disconnect());

describe('POST /api/vehicles/:id/purchase', () => {
  it('decreases quantity by 1 for a logged-in user', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 2 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(auth(userToken));
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(1);
  });

  it('returns 400 when out of stock and keeps quantity at 0', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 0 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`).set(auth(userToken));
    expect(res.status).toBe(400);
    const after = await prisma.vehicle.findUnique({ where: { id: vehicle.id } });
    expect(after?.quantity).toBe(0);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app).post(`/api/vehicles/${UNKNOWN_ID}/purchase`).set(auth(userToken));
    expect(res.status).toBe(404);
  });

  it('returns 401 without a token', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 1 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/purchase`);
    expect(res.status).toBe(401);
  });
});

describe('POST /api/vehicles/:id/restock', () => {
  it('lets an admin increase quantity', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 0 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/restock`).set(auth(adminToken)).send({ quantity: 10 });
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(10);
  });

  it('returns 403 for a regular user', async () => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 0 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/restock`).set(auth(userToken)).send({ quantity: 10 });
    expect(res.status).toBe(403);
  });

  it.each([0, -3, 2.5, 'ten', undefined])('returns 400 for invalid quantity %p', async (quantity) => {
    const vehicle = await prisma.vehicle.create({ data: { ...car, quantity: 0 } });
    const res = await request(app).post(`/api/vehicles/${vehicle.id}/restock`).set(auth(adminToken)).send({ quantity });
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown vehicle', async () => {
    const res = await request(app).post(`/api/vehicles/${UNKNOWN_ID}/restock`).set(auth(adminToken)).send({ quantity: 5 });
    expect(res.status).toBe(404);
  });
});