import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { SearchFilters } from '../types';

const FIELDS = [
  { key: 'make', label: 'MAKE', type: 'text', placeholder: 'Toyota' },
  { key: 'model', label: 'MODEL', type: 'text', placeholder: 'Civic' },
  { key: 'minPrice', label: 'MIN PRICE', type: 'number', placeholder: '0' },
  { key: 'maxPrice', label: 'MAX PRICE', type: 'number', placeholder: '50000' },
] as const;

type FormState = Record<(typeof FIELDS)[number]['key'], string>;
const EMPTY: FormState = { make: '', model: '', minPrice: '', maxPrice: '' };

interface Props {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortAsc: boolean;
  onToggleSort: () => void;
  onSearch: (filters: SearchFilters) => void;
}

export function FilterBar({ categories, activeCategory, onCategoryChange, sortAsc, onToggleSort, onSearch }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);

  const handleChange = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(form);
  };

  const handleReset = () => {
    setForm(EMPTY);
    onSearch(EMPTY);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3 font-mono text-sm">
        {['ALL', ...categories].map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              aria-pressed={active}
              className={`min-h-11 border px-5 tracking-widest transition ${
                active ? 'glow-box border-cyan bg-cyan text-ink' : 'border-line text-muted hover:border-cyan hover:text-cyan'
              }`}
            >
              {category.toUpperCase()}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onToggleSort}
          className="min-h-11 border border-nitro px-5 tracking-widest text-nitro transition hover:bg-nitro hover:text-ink"
        >
          SORT: PRICE {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 border border-line bg-panel/80 p-5 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto] lg:items-end"
      >
        {FIELDS.map((field) => (
          <label key={field.key} className="flex flex-col gap-2 font-mono text-xs tracking-widest text-muted">
            {field.label}
            <input
              type={field.type}
              min={field.type === 'number' ? 0 : undefined}
              value={form[field.key]}
              onChange={handleChange(field.key)}
              placeholder={field.placeholder}
              className="min-h-11 border border-line bg-ink px-3 font-body text-base text-fg focus:border-cyan focus:outline-none"
            />
          </label>
        ))}
        <button type="submit" className="clip-btn min-h-11 bg-nitro px-6 font-display text-sm font-bold tracking-widest text-ink transition hover:brightness-110">
          SEARCH
        </button>
        <button type="button" onClick={handleReset} className="min-h-11 border border-line px-5 font-mono text-sm text-muted hover:text-fg">
          RESET
        </button>
      </form>
    </div>
  );
}