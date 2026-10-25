import { useEffect, useRef, useState } from 'react';

export function Hero({ vehicleCount }: { vehicleCount: number }) {
  const ref = useRef<HTMLElement>(null);
  // 0 = at the top of the page, 1 = hero fully scrolled past
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = ref.current?.offsetHeight || 1;
      setProgress(Math.min(window.scrollY / height, 1));
    };
    // requestAnimationFrame = at most one update per screen refresh (smooth, cheap)
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[88vh] items-center overflow-hidden border-b border-line">
      {/* Outer div zooms on scroll; inner div keeps the load-in zoom animation */}
      <div className="absolute inset-0 will-change-transform" style={{ transform: `scale(${1 + progress * 0.15})` }} aria-hidden="true">
        <div className="animate-ken-burns absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center" />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/80 to-ink/30" aria-hidden="true" />

      <div
        className="relative mx-auto w-full max-w-7xl px-5 py-24 will-change-transform"
        style={{ opacity: Math.max(0, 1 - progress * 1.2), transform: `translateY(${progress * -80}px)` }}
      >
        <p className="font-mono text-cyan sm:text-lg">
          &gt; PLAYER 1 READY<span className="animate-blink">_</span>
        </p>
        <h1 className="animate-slide-in mt-6 font-display text-5xl font-black leading-[0.95] sm:text-7xl lg:text-8xl">
          SELECT
          <br />
          <span className="glow-cyan text-cyan">YOUR RIDE</span>
        </h1>
        <p className="mt-8 max-w-xl text-xl text-muted">
          {vehicleCount} machines on the lot. Filter by make, model or budget and take one home.
        </p>
        <a href="#garage" className="clip-btn mt-10 inline-flex min-h-14 items-center bg-nitro px-8 font-display font-bold tracking-widest text-ink transition hover:brightness-110">
          ▸ PRESS START
        </a>
      </div>
    </section>
  );
}