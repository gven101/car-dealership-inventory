import { Request, Response } from 'express';
import * as vehicleService from '../services/vehicle.service';

export async function list(_req: Request, res: Response) {
  res.json(await vehicleService.listVehicles());
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await vehicleService.createVehicle(req.body ?? {}));
}

export async function update(req: Request, res: Response) {
  res.json(await vehicleService.updateVehicle(req.params.id, req.body ?? {}));
}

export async function remove(req: Request, res: Response) {
  await vehicleService.deleteVehicle(req.params.id);
  res.status(204).send();
}
export async function purchase(req: Request, res: Response) {
  res.json(await vehicleService.purchaseVehicle(req.params.id));
}

export async function restock(req: Request, res: Response) {
  res.json(await vehicleService.restockVehicle(req.params.id, req.body?.quantity));
}