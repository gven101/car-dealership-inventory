import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  mode: 'login' | 'register';
}

const inputClass =
  'min-h-12 border border-line bg-ink px-4 font-body text-base text-fg focus:border-cyan focus:outline-none';
const labelClass = 'flex flex-col gap-2 font-mono text-xs tracking-widest text-muted';

export default function AuthPage({ mode }: Props) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isRegister = mode === 'register';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(form.name, form.email, form.password);
      else await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  const tabClass = (active: boolean) =>
    `flex min-h-12 items-center justify-center transition ${active ? 'bg-cyan text-ink' : 'text-muted hover:text-fg'}`;

  return (
    <div className="flex min-h-screen flex-col bg-ink lg:flex-row">
      <section className="relative flex min-h-[40vh] flex-1 flex-col justify-between overflow-hidden border-b border-line p-8 lg:border-b-0 lg:border-r lg:p-12">
        <div className="animate-ken-burns absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-50" aria-hidden="true" />
        <div className="absolute inset-0 bg-linear-to-t from-ink via-ink/70 to-transparent" aria-hidden="true" />
        <p className="relative font-display text-2xl font-black tracking-wider">
          NITRO<span className="text-nitro">GARAGE</span>
        </p>
        <div className="relative">
          <p className="font-mono text-cyan">
            &gt; {isRegister ? 'NEW PLAYER DETECTED' : 'PLAYER 1 READY'}
            <span className="animate-blink">_</span>
          </p>
          <h1 className="animate-slide-in mt-4 font-display text-5xl font-black leading-[0.95] sm:text-7xl">
            {isRegister ? 'CREATE' : 'START YOUR'}
            <br />
            <span className="glow-cyan text-cyan">{isRegister ? 'PROFILE' : 'ENGINE'}</span>
          </h1>
        </div>
      </section>

      <section className="grid-bg flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="clip-corner animate-slide-in w-full max-w-md bg-nitro/70 p-px">
          <form onSubmit={handleSubmit} className="clip-corner flex flex-col gap-5 bg-panel p-8">
            <div className="grid grid-cols-2 border border-line font-display text-sm font-bold tracking-widest">
              <Link to="/login" className={tabClass(!isRegister)}>LOGIN</Link>
              <Link to="/register" className={tabClass(isRegister)}>REGISTER</Link>
            </div>

            {isRegister && (
              <label className={labelClass}>
                NAME
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
              </label>
            )}
            <label className={labelClass}>
              EMAIL
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className={inputClass} />
            </label>
            <label className={labelClass}>
              PASSWORD
              <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </label>

            {error && <p role="alert" className="border-l-2 border-nitro bg-nitro/10 px-3 py-2 text-nitro">{error}</p>}

            <button type="submit" disabled={loading} className="clip-btn mt-2 min-h-14 bg-nitro font-display font-bold tracking-widest text-ink transition hover:brightness-110 disabled:opacity-60">
              {loading ? 'LOADING...' : isRegister ? '▸ CREATE PLAYER' : '▸ IGNITION'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}