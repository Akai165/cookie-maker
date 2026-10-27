import { useRef, useEffect } from 'react';

const ITEM_HEIGHT = 44; // Altezza di ogni cifra in px per un tocco ideale

/**
 * Singola colonna con le cifre che scorrono in verticale tramite:
 * - Touchscreen (swipe/drag)
 * - Mouse drag (click e trascina)
 * - Rotellina mouse (wheel)
 * - Frecce ▲ e ▼
 * - Click diretto sulla cifra
 */
function DigitColumn({ value, max = 9, onChange, label }) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);
  const hasMovedRef = useRef(false);

  const digits = Array.from({ length: max + 1 }, (_, i) => i);

  // Allinea lo scroll alla cifra corrente quando non si sta trascinando
  useEffect(() => {
    if (isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const targetTop = value * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - targetTop) > 2) {
      el.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  }, [value]);

  // Gestione Drag con Pointer Events (unificato per Touchscreen e Mouse)
  const handlePointerDown = (e) => {
    const el = containerRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartScrollTopRef.current = el.scrollTop;
    hasMovedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const deltaY = e.clientY - dragStartYRef.current;
    if (Math.abs(deltaY) > 3) {
      hasMovedRef.current = true;
    }

    // Spostamento fluido 1:1 sotto il cursore o dito
    el.scrollTop = dragStartScrollTopRef.current - deltaY;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignora
    }

    const el = containerRef.current;
    if (!el) return;

    if (hasMovedRef.current) {
      // Aggancia alla cifra più vicina
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(max, index));
      onChange(clamped);
      el.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  // Supporto rotellina del mouse (wheel)
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY > 0) {
      handleArrowDown();
    } else if (e.deltaY < 0) {
      handleArrowUp();
    }
  };

  // Frecce: ▲ seleziona sopra, ▼ seleziona sotto
  const handleArrowUp = () => {
    const next = value > 0 ? value - 1 : max;
    onChange(next);
  };

  const handleArrowDown = () => {
    const next = value < max ? value + 1 : 0;
    onChange(next);
  };

  const selectDigit = (d) => {
    if (hasMovedRef.current) return;
    onChange(d);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: d * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Freccia su */}
      <button
        type="button"
        onClick={handleArrowUp}
        aria-label={`Cifra precedente ${label || ''}`}
        className="w-12 h-7 flex items-center justify-center text-xs font-bold rounded-t-lg transition-all active:scale-90 hover:opacity-80 cursor-pointer"
        style={{ color: 'var(--primary)', background: 'var(--bg-subtle)' }}
      >
        ▲
      </button>

      {/* Rullo cifre verticale trascinabile con Touchscreen o Mouse */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative w-12 sm:w-14 h-[132px] overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none"
        style={{
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Barra di evidenziazione centrale */}
        <div
          className="absolute left-0 right-0 top-[44px] h-[44px] pointer-events-none rounded-md transition-all"
          style={{
            background: 'var(--primary-light)',
            borderTop: '2px solid var(--primary)',
            borderBottom: '2px solid var(--primary)',
            opacity: 0.35,
          }}
        />

        {/* Gradiente sfumatura sopra */}
        <div
          className="absolute inset-x-0 top-0 h-8 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to bottom, var(--bg-card), transparent)',
          }}
        />

        {/* Container scrollabile */}
        <div
          ref={containerRef}
          className="h-full overflow-y-hidden"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            paddingTop: `${ITEM_HEIGHT}px`,
            paddingBottom: `${ITEM_HEIGHT}px`,
          }}
        >
          {digits.map((d) => {
            const isSelected = d === value;
            return (
              <div
                key={d}
                onClick={() => selectDigit(d)}
                style={{
                  height: `${ITEM_HEIGHT}px`,
                  color: isSelected ? 'var(--primary)' : 'var(--text-faint)',
                  transform: isSelected ? 'scale(1.15)' : 'scale(0.85)',
                  opacity: isSelected ? 1 : 0.45,
                }}
                className="flex items-center justify-center font-black text-2xl transition-all duration-150"
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* Gradiente sfumatura sotto */}
        <div
          className="absolute inset-x-0 bottom-0 h-8 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to top, var(--bg-card), transparent)',
          }}
        />
      </div>

      {/* Freccia giù */}
      <button
        type="button"
        onClick={handleArrowDown}
        aria-label={`Cifra successiva ${label || ''}`}
        className="w-12 h-7 flex items-center justify-center text-xs font-bold rounded-b-lg transition-all active:scale-90 hover:opacity-80 cursor-pointer"
        style={{ color: 'var(--primary)', background: 'var(--bg-subtle)' }}
      >
        ▼
      </button>
    </div>
  );
}

/**
 * Componente per selezionare Minuti e Secondi con slider verticali delle singole cifre.
 *
 * Props:
 *  - minutes: number (0-99)
 *  - seconds: number (0-59)
 *  - onChange: ({ minutes, seconds }) => void
 */
export default function VerticalDigitPicker({ minutes = 5, seconds = 0, onChange }) {
  // Scomponi in cifre decine e unità
  const minTens = Math.floor(Math.min(99, Math.max(0, minutes)) / 10);
  const minUnits = Math.min(99, Math.max(0, minutes)) % 10;
  const secTens = Math.floor(Math.min(59, Math.max(0, seconds)) / 10);
  const secUnits = Math.min(59, Math.max(0, seconds)) % 10;

  const update = (newMinTens, newMinUnits, newSecTens, newSecUnits) => {
    const newMinutes = newMinTens * 10 + newMinUnits;
    const newSeconds = newSecTens * 10 + newSecUnits;
    onChange({ minutes: newMinutes, seconds: newSeconds });
  };

  const PRESETS = [
    { label: '1 min', m: 1, s: 0 },
    { label: '3 min', m: 3, s: 0 },
    { label: '5 min', m: 5, s: 0 },
    { label: '10 min', m: 10, s: 0 },
    { label: '15 min', m: 15, s: 0 },
    { label: '25 min 🍅', m: 25, s: 0 },
    { label: '30 min', m: 30, s: 0 },
  ];

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Box con i 4 rulli verticali */}
      <div
        className="p-4 rounded-2xl border-2 shadow-inner w-full flex flex-col items-center"
        style={{
          background: 'var(--bg-subtle)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center justify-center gap-2 sm:gap-4">
          {/* Gruppo Minuti */}
          <div className="flex flex-col items-center">
            <span
              className="text-[11px] font-black uppercase tracking-wider mb-2"
              style={{ color: 'var(--primary-dark)' }}
            >
              Minuti
            </span>
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <DigitColumn
                value={minTens}
                max={9}
                onChange={(v) => update(v, minUnits, secTens, secUnits)}
                label="decine minuti"
              />
              <DigitColumn
                value={minUnits}
                max={9}
                onChange={(v) => update(minTens, v, secTens, secUnits)}
                label="unità minuti"
              />
            </div>
          </div>

          {/* Due punti separatori */}
          <div className="flex flex-col items-center pt-5">
            <span className="text-3xl font-black animate-pulse" style={{ color: 'var(--primary)' }}>
              :
            </span>
          </div>

          {/* Gruppo Secondi */}
          <div className="flex flex-col items-center">
            <span
              className="text-[11px] font-black uppercase tracking-wider mb-2"
              style={{ color: 'var(--primary-dark)' }}
            >
              Secondi
            </span>
            <div className="flex items-center gap-1.5 p-1.5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
              <DigitColumn
                value={secTens}
                max={5}
                onChange={(v) => update(minTens, minUnits, v, secUnits)}
                label="decine secondi"
              />
              <DigitColumn
                value={secUnits}
                max={9}
                onChange={(v) => update(minTens, minUnits, secTens, v)}
                label="unità secondi"
              />
            </div>
          </div>
        </div>

        <p className="text-[11px] font-medium mt-2 text-center" style={{ color: 'var(--text-soft)' }}>
          Trascina con il dito / mouse o usa le frecce per regolare
        </p>

        {/* Badge tempo totale */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--text-mid)' }}>
            Durata impostata:
          </span>
          <span
            className="text-xs font-black px-2.5 py-0.5 rounded-full"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Preset veloci */}
      <div className="w-full">
        <span className="text-[11px] font-semibold block mb-1.5" style={{ color: 'var(--text-faint)' }}>
          Preset rapidi:
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map((p) => {
            const isMatch = minutes === p.m && seconds === p.s;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onChange({ minutes: p.m, seconds: p.s })}
                className="py-1 px-2.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                style={
                  isMatch
                    ? { background: 'var(--primary)', color: '#fff' }
                    : {
                        background: 'var(--bg-card)',
                        color: 'var(--text-mid)',
                        border: '1px solid var(--border)',
                      }
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
