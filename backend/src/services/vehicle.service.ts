import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/AppError';

type VehicleData = { make?: string; model?: string; category?: string; price?: number; quantity?: number };

const TEXT_FIELDS = ['make', 'model', 'category'] as const;

/** Validates input. partial=true for updates (fields optional). */
function validateVehicle(input: Record<string, unknown>, partial: boolean): VehicleData {
  const data: VehicleData = {};

  for (const field of TEXT_FIELDS) {
    const value = input[field];
    if (value === undefined) {
      if (!partial) throw new AppError(400, `${field} is required`);
      continue;
    }
    if (typeof value !== 'string' || !value.trim()) {
      throw new AppError(400, `${field} must be a non-empty string`);
    }
    data[field] = value.trim();
  }

  if (input.price === undefined) {
    if (!partial) throw new AppError(400, 'price is required');
  } else if (typeof input.price !== 'number' || !(input.price > 0)) {
    throw new AppError(400, 'price must be a positive number');
  } else {
    data.price = input.price;
  }

  if (input.quantity !== undefined) {
    if (!Number.isInteger(input.quantity) || (input.quantity as number) < 0) {
      throw new AppError(400, 'quantity must be a non-negative integer');
    }
    data.quantity = input.quantity as number;
  }

  return data;
}

async function findVehicleOrThrow(id: string) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new AppError(404, 'Vehicle not found');
  return vehicle;
}

/** Returns a trimmed string, or undefined if empty / not a string. */
function textFilter(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function priceFilter(value: unknown, name: string) {
  if (value === undefined || value === '') return undefined;
  const num = Number(value);
  if (typeof value !== 'string' || Number.isNaN(num) || num < 0) {
    throw new AppError(400, `${name} must be a non-negative number`);
  }
  return num;
}

export function listVehicles() {
  return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
}

export function searchVehicles(query: Record<string, unknown>) {
  const where: Prisma.VehicleWhereInput = {};

  for (const field of TEXT_FIELDS) {
    const value = textFilter(query[field]);
    // contains + insensitive = partial, case-insensitive match
    if (value) where[field] = { contains: value, mode: 'insensitive' };
  }

  const minPrice = priceFilter(query.minPrice, 'minPrice');
  const maxPrice = priceFilter(query.maxPrice, 'maxPrice');
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = { gte: minPrice, lte: maxPrice };
  }

  return prisma.vehicle.findMany({ where, orderBy: { createdAt: 'desc' } });
}

export function createVehicle(input: Record<string, unknown>) {
  const data = validateVehicle(input, false);
  return prisma.vehicle.create({ data: data as Prisma.VehicleCreateInput });
}

export async function updateVehicle(id: string, input: Record<string, unknown>) {
  const data = validateVehicle(input, true);
  await findVehicleOrThrow(id);
  return prisma.vehicle.update({ where: { id }, data });
}

export async function deleteVehicle(id: string) {
  await findVehicleOrThrow(id);
  await prisma.vehicle.delete({ where: { id } });
}

export async function purchaseVehicle(id: string) {
  // Atomic: only decrements if quantity > 0, in ONE database query.
  // Prevents two simultaneous buyers taking the last car.
  const result = await prisma.vehicle.updateMany({
    where: { id, quantity: { gt: 0 } },
    data: { quantity: { decrement: 1 } },
  });

  if (result.count === 0) {
    await findVehicleOrThrow(id); // 404 if it doesn't exist
    throw new AppError(400, 'Vehicle is out of stock');
  }
  return findVehicleOrThrow(id);
}

export async function restockVehicle(id: string, quantity: unknown) {
  if (!Number.isInteger(quantity) || (quantity as number) <= 0) {
    throw new AppError(400, 'quantity must be a positive integer');
  }
  await findVehicleOrThrow(id);
  return prisma.vehicle.update({
    where: { id },
    data: { quantity: { increment: quantity as number } },
  });
}