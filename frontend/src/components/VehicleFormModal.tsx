import { useEffect, useState, type FormEvent } from 'react';
import type { Vehicle, VehicleInput } from '../types';

const FIELDS = [
  { key: 'make', label: 'MAKE', type: 'text' },
  { key: 'model', label: 'MODEL', type: 'text' },
  { key: 'category', label: 'CATEGORY', type: 'text' },
  { key: 'price', label: 'PRICE ($)', type: 'number' },
  { key: 'quantity', label: 'QUANTITY', type: 'number' },
] as const;

type FormState = Record<(typeof FIELDS)[number]['key'], string>;

interface Props {
  vehicle: Vehicle | null; // null = adding a new vehicle
  onClose: () => void;
  onSave: (data: VehicleInput) => Promise<void>;
}

export function VehicleFormModal({ vehicle, onClose, onSave }: Props) {
  const [form, setForm] = useState<FormState>({
    make: vehicle?.make ?? '',
    model: vehicle?.model ?? '',
    category: vehicle?.category ?? '',
    price: vehicle ? String(vehicle.price) : '',
    quantity: vehicle ? String(vehicle.quantity) : '0',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        make: form.make,
        model: form.model,
        category: form.category,
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
    } catch (err) {
      setError((err as Error).message); // backend validation message
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="clip-corner w-full max-w-lg bg-cyan p-px" onClick={(e) => e.stopPropagation()}>
        <form
          role="dialog"
          aria-modal="true"
          aria-labelledby="vehicle-form-title"
          onSubmit={handleSubmit}
          className="clip-corner flex flex-col gap-4 bg-panel p-8"
        >
          <p className="font-mono text-sm text-nitro">{vehicle ? '// TUNE MACHINE' : '// NEW MACHINE'}</p>
          <h2 id="vehicle-form-title" className="font-display text-3xl font-black">
            {vehicle ? 'EDIT VEHICLE' : 'ADD VEHICLE'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col gap-2 font-mono text-xs tracking-widest text-muted">
                {field.label}
                <input
                  required
                  type={field.type}
                  min={field.type === 'number' ? 0 : undefined}
                  step={field.key === 'price' ? 'any' : undefined}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="min-h-11 border border-line bg-ink px-3 font-body text-base text-fg focus:border-cyan focus:outline-none"
                />
              </label>
            ))}
          </div>
          {error && <p role="alert" className="border-l-2 border-nitro bg-nitro/10 px-3 py-2 text-nitro">{error}</p>}
          <div className="mt-2 flex gap-3">
            <button type="submit" disabled={saving} className="clip-btn min-h-12 flex-1 bg-nitro font-display text-sm font-bold tracking-widest text-ink disabled:opacity-60">
              {saving ? 'SAVING...' : 'SAVE'}
            </button>
            <button type="button" onClick={onClose} className="min-h-12 border border-line px-6 font-mono text-sm text-muted hover:text-fg">
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}