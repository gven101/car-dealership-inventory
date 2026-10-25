import { apiRequest } from './client';
import type { SearchFilters, Vehicle, VehicleInput } from '../types';

export const vehicleApi = {
  list: () => apiRequest<Vehicle[]>('/vehicles'),

  search: (filters: SearchFilters) => {
    // Only send filters that have a value
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value) as [string, string][],
    );
    return apiRequest<Vehicle[]>(`/vehicles/search?${params}`);
  },

  create: (data: VehicleInput) =>
    apiRequest<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: Partial<VehicleInput>) =>
    apiRequest<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  remove: (id: string) => apiRequest<void>(`/vehicles/${id}`, { method: 'DELETE' }),

  purchase: (id: string) => apiRequest<Vehicle>(`/vehicles/${id}/purchase`, { method: 'POST' }),

  restock: (id: string, quantity: number) =>
    apiRequest<Vehicle>(`/vehicles/${id}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    }),
};