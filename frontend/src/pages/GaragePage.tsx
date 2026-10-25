import { useCallback, useEffect, useMemo, useState } from 'react';
import { vehicleApi } from '../api/vehicles';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Reveal } from '../components/Reveal';
import { FilterBar } from '../components/FilterBar';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleFormModal } from '../components/VehicleFormModal';
import type { SearchFilters, Vehicle, VehicleInput } from '../types';

type Toast = { message: string; type: 'success' | 'error' };

export default function GaragePage() {
  const { isAdmin } = useAuth();
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [results, setResults] = useState<Vehicle[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [category, setCategory] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(true);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  // undefined = modal closed, null = adding new, Vehicle = editing
  const [editing, setEditing] = useState<Vehicle | null | undefined>(undefined);

  // Load all vehicles (for stats + category chips) and the filtered results
  const refresh = useCallback(async () => {
    try {
      const search = { ...filters, category: category === 'ALL' ? undefined : category };
      const [all, found] = await Promise.all([vehicleApi.list(), vehicleApi.search(search)]);
      setAllVehicles(all);
      setResults(found);
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [filters, category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-hide toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const categories = useMemo(() => [...new Set(allVehicles.map((v) => v.category))].sort(), [allVehicles]);

  const sorted = useMemo(
    () => [...results].sort((a, b) => (sortAsc ? a.price - b.price : b.price - a.price)),
    [results, sortAsc],
  );

  const stats = [
    { label: 'MODELS ON THE LOT', value: allVehicles.length },
    { label: 'UNITS IN STOCK', value: allVehicles.reduce((sum, v) => sum + v.quantity, 0) },
    { label: 'CATEGORIES', value: categories.length },
    { label: 'SOLD OUT', value: allVehicles.filter((v) => v.quantity === 0).length },
  ];

  /** Runs an API action, shows a toast, then reloads the list. */
  const runAction = async (id: string, action: () => Promise<unknown>, success: string) => {
    setBusyId(id);
    try {
      await action();
      setToast({ message: success, type: 'success' });
      await refresh();
    } catch (err) {
      setToast({ message: (err as Error).message, type: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const handlePurchase = (v: Vehicle) =>
    runAction(v.id, () => vehicleApi.purchase(v.id), `${v.make} ${v.model} is yours!`);

  const handleRestock = (v: Vehicle, quantity: number) =>
    runAction(v.id, () => vehicleApi.restock(v.id, quantity), `${v.model} restocked +${quantity}`);

  const handleDelete = (v: Vehicle) => {
    if (!window.confirm(`Delete ${v.make} ${v.model}?`)) return;
    runAction(v.id, () => vehicleApi.remove(v.id), `${v.model} deleted`);
  };

  // Errors are thrown back to the modal so it can show them
  const handleSave = async (data: VehicleInput) => {
    if (editing) await vehicleApi.update(editing.id, data);
    else await vehicleApi.create(data);
    setToast({ message: editing ? 'Vehicle updated' : 'Vehicle added', type: 'success' });
    setEditing(undefined);
    await refresh();
  };

  return (
    <div className="min-h-screen bg-ink">
      <Navbar />

      {/* HERO */}
      <section id="top" className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-line">
        <div className="animate-ken-burns absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center" aria-hidden="true" />
        <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24">
          <p className="font-mono text-cyan sm:text-lg">
            &gt; PLAYER 1 READY<span className="animate-blink">_</span>
          </p>
          <h1 className="animate-slide-in mt-6 font-display text-5xl font-black leading-[0.95] sm:text-7xl lg:text-8xl">
            SELECT
            <br />
            <span className="glow-cyan text-cyan">YOUR RIDE</span>
          </h1>
          <p className="mt-8 max-w-xl text-xl text-muted">
            {allVehicles.length} machines on the lot. Filter by make, model or budget and take one home.
          </p>
          <a href="#garage" className="clip-btn mt-10 inline-flex min-h-14 items-center bg-nitro px-8 font-display font-bold tracking-widest text-ink transition hover:brightness-110">
            ▸ PRESS START
          </a>
        </div>
      </section>

      {/* GARAGE */}
      <section id="garage" className="grid-bg scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <Reveal>
            <p className="font-mono text-nitro">{'// STAGE 01'}</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-5xl font-black sm:text-6xl">THE GARAGE</h2>
              {isAdmin && (
                <button onClick={() => setEditing(null)} className="clip-btn glow-box min-h-12 bg-cyan px-6 font-display text-sm font-bold tracking-widest text-ink">
                  + ADD VEHICLE
                </button>
              )}
            </div>
          </Reveal>

          <Reveal delay={100} className="mt-10">
            <FilterBar
              categories={categories}
              activeCategory={category}
              onCategoryChange={setCategory}
              sortAsc={sortAsc}
              onToggleSort={() => setSortAsc(!sortAsc)}
              onSearch={setFilters}
            />
          </Reveal>

          {loading ? (
            <p className="mt-16 font-mono text-muted">LOADING<span className="animate-blink">...</span></p>
          ) : sorted.length === 0 ? (
            <p className="mt-16 font-mono text-muted">NO MACHINES MATCH. TRY ANOTHER FILTER.</p>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {sorted.map((vehicle, i) => (
                <Reveal key={vehicle.id} delay={(i % 3) * 100}>
                  <VehicleCard
                    vehicle={vehicle}
                    isAdmin={isAdmin}
                    busy={busyId === vehicle.id}
                    onPurchase={handlePurchase}
                    onRestock={handleRestock}
                    onEdit={setEditing}
                    onDelete={handleDelete}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* STATS (real numbers from the API) */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 py-20 text-center md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <p className="glow-cyan font-display text-5xl font-black text-cyan">{stat.value}</p>
              <p className="mt-3 font-mono text-sm tracking-widest text-muted">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="grid-bg">
        <Reveal className="mx-auto max-w-4xl px-5 py-32 text-center">
          <p className="font-mono text-nitro">{'// FINAL BOSS'}</p>
          <h2 className="mt-4 font-display text-4xl font-black sm:text-6xl">
            READY TO <span className="text-nitro">DRIVE?</span>
          </h2>
          <p className="mt-6 text-xl text-muted">
            {stats[1].value} units in stock right now. Pick yours before they're gone.
          </p>
          <a href="#garage" className="clip-btn glow-box mt-10 inline-flex min-h-14 items-center bg-cyan px-10 font-display font-bold tracking-widest text-ink">
            BACK TO THE GARAGE
          </a>
        </Reveal>
      </section>

      <footer className="border-t border-line py-8 text-center font-mono text-sm text-muted">
        © 2026 NITRO GARAGE · BUILT WITH TDD
      </footer>

      {editing !== undefined && (
        <VehicleFormModal vehicle={editing} onClose={() => setEditing(undefined)} onSave={handleSave} />
      )}

      {toast && (
        <div role="status" className={`clip-btn fixed right-6 bottom-6 z-50 px-6 py-4 font-mono text-sm text-ink ${toast.type === 'success' ? 'bg-lime' : 'bg-nitro'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}