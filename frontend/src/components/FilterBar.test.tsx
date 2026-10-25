import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

function renderBar() {
  const props = { onCategoryChange: vi.fn(), onToggleSort: vi.fn(), onSearch: vi.fn() };
  render(<FilterBar categories={['Sedan', 'SUV']} activeCategory="ALL" sortAsc {...props} />);
  return props;
}

describe('FilterBar', () => {
  it('sends the typed filters when searching', async () => {
    const { onSearch } = renderBar();
    await userEvent.type(screen.getByLabelText(/make/i), 'Toyota');
    await userEvent.type(screen.getByLabelText(/max price/i), '30000');
    await userEvent.click(screen.getByRole('button', { name: 'SEARCH' }));
    expect(onSearch).toHaveBeenCalledWith({ make: 'Toyota', model: '', minPrice: '', maxPrice: '30000' });
  });

  it('shows a chip per category and reports the selected one', async () => {
    const { onCategoryChange } = renderBar();
    await userEvent.click(screen.getByRole('button', { name: 'SUV' }));
    expect(onCategoryChange).toHaveBeenCalledWith('SUV');
  });

  it('clears filters on reset', async () => {
    const { onSearch } = renderBar();
    await userEvent.type(screen.getByLabelText(/make/i), 'Honda');
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onSearch).toHaveBeenCalledWith({ make: '', model: '', minPrice: '', maxPrice: '' });
  });
});