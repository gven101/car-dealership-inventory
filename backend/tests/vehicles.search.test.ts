import request from 'supertest';
import app from '../src/app';
import { prisma, resetDb } from './helpers/db';
import { getUserToken } from './helpers/auth';

let token: string;

beforeEach(async () => {
  await resetDb();
  token = await getUserToken();
  await prisma.vehicle.createMany({
    data: [
      { make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 5 },
      { make: 'Toyota', model: 'RAV4', category: 'SUV', price: 30000, quantity: 2 },
      { make: 'Honda', model: 'Civic', category: 'Sedan', price: 22000, quantity: 0 },
    ],
  });
});
afterAll(() => prisma.$disconnect());

const search = (query: string) =>
  request(app).get(`/api/vehicles/search?${query}`).set('Authorization', `Bearer ${token}`);

const models = (body: { model: string }[]) => body.map((v) => v.model).sort();

describe('GET /api/vehicles/search', () => {
  it('filters by make (case-insensitive)', async () => {
    const res = await search('make=toyota');
    expect(res.status).toBe(200);
    expect(models(res.body)).toEqual(['Corolla', 'RAV4']);
  });

  it('filters by partial model name', async () => {
    const res = await search('model=civ');
    expect(models(res.body)).toEqual(['Civic']);
  });

  it('filters by category', async () => {
    const res = await search('category=suv');
    expect(models(res.body)).toEqual(['RAV4']);
  });

  it('filters by price range', async () => {
    const res = await search('minPrice=21000&maxPrice=30000');
    expect(models(res.body)).toEqual(['Civic', 'RAV4']);
  });

  it('combines filters', async () => {
    const res = await search('make=toyota&category=sedan');
    expect(models(res.body)).toEqual(['Corolla']);
  });

  it('returns all vehicles when no filters are given', async () => {
    const res = await search('');
    expect(res.body).toHaveLength(3);
  });

  it('returns 400 for a non-numeric price', async () => {
    const res = await search('minPrice=abc');
    expect(res.status).toBe(400);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/vehicles/search?make=toyota');
    expect(res.status).toBe(401);
  });
});