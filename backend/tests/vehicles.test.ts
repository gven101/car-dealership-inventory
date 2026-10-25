import request from 'supertest';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';
import { getAdminToken, getUserToken } from './helpers/auth';

const car = { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 };
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

describe('POST /api/vehicles', () => {
  it('lets an admin add a vehicle', async () => {
    const res = await request(app).post('/api/vehicles').set(auth(adminToken)).send(car);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(car);
    expect(res.body.id).toEqual(expect.any(String));
  });

  it('returns 403 for a regular user', async () => {
    const res = await request(app).post('/api/vehicles').set(auth(userToken)).send(car);
    expect(res.status).toBe(403);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).post('/api/vehicles').send(car);
    expect(res.status).toBe(401);
  });

  it('returns 400 when a required field is missing', async () => {
    const { make, ...noMake } = car;
    const res = await request(app).post('/api/vehicles').set(auth(adminToken)).send(noMake);
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-positive price', async () => {
    const res = await request(app).post('/api/vehicles').set(auth(adminToken)).send({ ...car, price: -5 });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a negative quantity', async () => {
    const res = await request(app).post('/api/vehicles').set(auth(adminToken)).send({ ...car, quantity: -1 });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/vehicles', () => {
  it('lists all vehicles for a logged-in user', async () => {
    await prisma.vehicle.createMany({ data: [car, { ...car, model: 'Camry' }] });
    const res = await request(app).get('/api/vehicles').set(auth(userToken));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/vehicles/:id', () => {
  it('lets an admin update a vehicle', async () => {
    const vehicle = await prisma.vehicle.create({ data: car });
    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).set(auth(adminToken)).send({ price: 18000 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ...car, price: 18000 });
  });

  it('returns 403 for a regular user', async () => {
    const vehicle = await prisma.vehicle.create({ data: car });
    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).set(auth(userToken)).send({ price: 1 });
    expect(res.status).toBe(403);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).put(`/api/vehicles/${UNKNOWN_ID}`).set(auth(adminToken)).send({ price: 1 });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid data', async () => {
    const vehicle = await prisma.vehicle.create({ data: car });
    const res = await request(app).put(`/api/vehicles/${vehicle.id}`).set(auth(adminToken)).send({ price: 'cheap' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/vehicles/:id', () => {
  it('lets an admin delete a vehicle', async () => {
    const vehicle = await prisma.vehicle.create({ data: car });
    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(auth(adminToken));
    expect(res.status).toBe(204);
    expect(await prisma.vehicle.count()).toBe(0);
  });

  it('returns 403 for a regular user', async () => {
    const vehicle = await prisma.vehicle.create({ data: car });
    const res = await request(app).delete(`/api/vehicles/${vehicle.id}`).set(auth(userToken));
    expect(res.status).toBe(403);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app).delete(`/api/vehicles/${UNKNOWN_ID}`).set(auth(adminToken));
    expect(res.status).toBe(404);
  });
});