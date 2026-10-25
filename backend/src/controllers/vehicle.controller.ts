import { Request, Response } from 'express';
import * as vehicleService from '../services/vehicle.service';

// Routes with :id — tells TypeScript id is a single string
type IdRequest = Request<{ id: string }>;

export async function list(_req: Request, res: Response) {
  res.json(await vehicleService.listVehicles());
}

export async function search(req: Request, res: Response) {
  res.json(await vehicleService.searchVehicles(req.query));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await vehicleService.createVehicle(req.body ?? {}));
}

export async function update(req: IdRequest, res: Response) {
  res.json(await vehicleService.updateVehicle(req.params.id, req.body ?? {}));
}

export async function remove(req: IdRequest, res: Response) {
  await vehicleService.deleteVehicle(req.params.id);
  res.status(204).send();
}

export async function purchase(req: IdRequest, res: Response) {
  res.json(await vehicleService.purchaseVehicle(req.params.id));
}

export async function restock(req: IdRequest, res: Response) {
  res.json(await vehicleService.restockVehicle(req.params.id, req.body?.quantity));
}