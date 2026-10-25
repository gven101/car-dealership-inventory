import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VehicleCard } from './VehicleCard';
import type { Vehicle } from '../types';

const vehicle: Vehicle = { id: '1', make: 'Toyota', model: 'Corolla', category: 'Sedan', price: 20000, quantity: 3 };

function renderCard(overrides: Partial<Vehicle> = {}, isAdmin = false) {
  const handlers = { onPurchase: vi.fn(), onRestock: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() };
  render(<VehicleCard vehicle={{ ...vehicle, ...overrides }} isAdmin={isAdmin} busy={false} {...handlers} />);
  return handlers;
}

describe('VehicleCard', () => {
  it('shows the vehicle details', () => {
    renderCard();
    expect(screen.getByText('Corolla')).toBeInTheDocument();
    expect(screen.getByText('$20,000')).toBeInTheDocument();
  });

  it('calls onPurchase when Purchase is clicked', async () => {
    const handlers = renderCard();
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }));
    expect(handlers.onPurchase).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('disables the purchase button when quantity is 0', () => {
    renderCard({ quantity: 0 });
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });

  it('hides admin controls from regular users', () => {
    renderCard();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /restock/i })).not.toBeInTheDocument();
  });

  it('lets an admin restock with a quantity', async () => {
    const handlers = renderCard({}, true);
    await userEvent.click(screen.getByRole('button', { name: /restock/i }));
    await userEvent.type(screen.getByLabelText(/restock quantity/i), '5');
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(handlers.onRestock).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }), 5);
  });

  it('lets an admin trigger edit and delete', async () => {
    const handlers = renderCard({}, true);
    await userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(handlers.onEdit).toHaveBeenCalled();
    expect(handlers.onDelete).toHaveBeenCalled();
  });
});