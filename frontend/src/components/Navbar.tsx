import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [progress, setProgress] = useState(0);

  // Scroll progress bar (the cyan line under the header)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        <a href="#top" className="font-display text-xl font-black tracking-wider sm:text-2xl">
          NITRO<span className="text-nitro">GARAGE</span>
        </a>
        {user && (
          <div className="flex items-center gap-4 font-mono text-sm">
            <span className="hidden text-muted sm:inline">
              P1 · <span className="text-fg">{user.name}</span>
            </span>
            <span className={`px-2 py-0.5 text-xs text-ink ${isAdmin ? 'bg-nitro' : 'bg-lime'}`}>
              {isAdmin ? 'ADMIN' : 'PLAYER'}
            </span>
            <button
              onClick={logout}
              className="min-h-11 border border-line px-4 text-muted transition hover:border-cyan hover:text-cyan"
            >
              LOG OUT
            </button>
          </div>
        )}
      </div>
      <div
        className="glow-box absolute bottom-0 left-0 h-0.5 bg-cyan"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />
    </header>
  );
}