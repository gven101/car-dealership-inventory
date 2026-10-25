import { useState, type FormEvent } from 'react';
import type { Vehicle } from '../types';

const GLOW_COLORS = ['#5ce1e6', '#f07c3e', '#9be564', '#ff5c8a', '#a78bfa'];
const MAX_PIPS = 10;

/** Same category always gets the same glow colour. */
function colorFor(category: string) {
  let hash = 0;
  for (const ch of category.toLowerCase()) hash = (hash + ch.charCodeAt(0)) % GLOW_COLORS.length;
  return GLOW_COLORS[hash];
}

interface Props {
  vehicle: Vehicle;
  isAdmin: boolean;
  busy: boolean;
  onPurchase: (vehicle: Vehicle) => void;
  onRestock: (vehicle: Vehicle, quantity: number) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleCard({ vehicle, isAdmin, busy, onPurchase, onRestock, onEdit, onDelete }: Props) {
  const [showRestock, setShowRestock] = useState(false);
  const [restockQty, setRestockQty] = useState('');

  const soldOut = vehicle.quantity === 0;
  const low = vehicle.quantity > 0 && vehicle.quantity <= 2;
  const glow = soldOut ? '#3a4552' : colorFor(vehicle.category);
  const badgeClass = soldOut ? 'border-muted text-muted' : low ? 'border-nitro text-nitro' : 'border-lime text-lime';

  const submitRestock = (e: FormEvent) => {
    e.preventDefault();
    onRestock(vehicle, Number(restockQty));
    setRestockQty('');
    setShowRestock(false);
  };

  return (
    // Outer div = 1px coloured "border" that follows the clipped corners
    <div className={`clip-corner h-full p-px transition duration-300 hover:-translate-y-1.5 ${soldOut ? 'bg-line' : 'bg-nitro/70 hover:bg-cyan'}`}>
      <article className="clip-corner flex h-full flex-col gap-5 bg-panel p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-muted">{vehicle.make}</p>
            <h3 className="font-display text-2xl font-bold">{vehicle.model}</h3>
          </div>
          <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center border-2 ${badgeClass}`}>
            <span className="font-display text-xl font-bold leading-none">{vehicle.quantity}</span>
            <span className="font-mono text-[10px]">QTY</span>
          </div>
        </header>

        <div className="scanlines relative flex h-36 items-center justify-center overflow-hidden bg-ink/60">
          <div
            className="animate-float h-14 w-3/5 rounded-[50%]"
            style={{ background: glow, boxShadow: `0 0 40px ${glow}`, opacity: soldOut ? 0.4 : 0.85 }}
            aria-hidden="true"
          />
          {soldOut && (
            <span className="absolute rotate-[-8deg] border-2 border-nitro px-3 py-1 font-display text-lg font-bold text-nitro">
              SOLD OUT
            </span>
          )}
          <span className="absolute bottom-2 left-3 font-mono text-xs text-muted">{vehicle.category.toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-sm">
          <span className="w-14 text-muted">STOCK</span>
          <div className="flex flex-1 gap-1" aria-hidden="true">
            {Array.from({ length: MAX_PIPS }, (_, i) => (
              <span key={i} className={`h-3 flex-1 ${i < vehicle.quantity ? (low ? 'bg-nitro' : 'bg-cyan') : 'bg-line'}`} />
            ))}
          </div>
          <span className="w-8 text-right">{vehicle.quantity}</span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
          <span className="glow-cyan font-display text-3xl font-bold text-cyan">
            ${vehicle.price.toLocaleString('en-US')}
          </span>
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={soldOut || busy}
            className="clip-btn min-h-12 bg-nitro px-6 font-display text-sm font-bold tracking-widest text-ink transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {soldOut ? 'OUT OF STOCK' : '▸ PURCHASE'}
          </button>
        </div>

        {isAdmin && (
          <div className="border-t border-line pt-4">
            {showRestock ? (
              <form onSubmit={submitRestock} className="flex gap-2">
                <label htmlFor={`restock-${vehicle.id}`} className="sr-only">Restock quantity</label>
                <input
                  id={`restock-${vehicle.id}`}
                  type="number"
                  min={1}
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  placeholder="Qty"
                  className="min-h-11 w-24 border border-line bg-ink px-3 font-mono focus:border-cyan focus:outline-none"
                />
                <button type="submit" disabled={busy} className="min-h-11 flex-1 border border-cyan font-mono text-sm text-cyan transition hover:bg-cyan hover:text-ink">
                  CONFIRM
                </button>
                <button type="button" onClick={() => setShowRestock(false)} aria-label="Cancel restock" className="min-h-11 border border-line px-4 font-mono text-sm text-muted hover:text-fg">
                  ✕
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-3 gap-2 font-mono text-sm">
                <button onClick={() => setShowRestock(true)} className="min-h-11 border border-cyan/60 text-cyan transition hover:bg-cyan hover:text-ink">RESTOCK</button>
                <button onClick={() => onEdit(vehicle)} className="min-h-11 border border-line transition hover:border-fg">EDIT</button>
                <button onClick={() => onDelete(vehicle)} className="min-h-11 border border-nitro/50 text-nitro transition hover:bg-nitro hover:text-ink">DELETE</button>
              </div>
            )}
          </div>
        )}
      </article>
    </div>
  );
}