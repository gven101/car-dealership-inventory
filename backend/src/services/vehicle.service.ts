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

export function listVehicles() {
  return prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } });
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