import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, Palette, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme.js';

const MODES = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

const ACCENTS = [
  { id: 'brand', label: 'Blue', swatch: 'bg-brand-500' },
  { id: 'emerald', label: 'Emerald', swatch: 'bg-emerald-500' },
  { id: 'violet', label: 'Violet', swatch: 'bg-violet-500' },
  { id: 'amber', label: 'Amber', swatch: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', swatch: 'bg-rose-500' },
];

/**
 * Theme picker - opens a small popover with mode + accent options.
 * The trigger icon reflects the current mode.
 */
export default function ThemeToggle() {
  const { mode, accent, setMode, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const Icon = (MODES.find((m) => m.id === mode) ?? MODES[2]).icon;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="btn-ghost"
        onClick={() => setOpen((o) => !o)}
        title="Theme settings"
        aria-label="Theme settings"
      >
        <Icon size={16} />
        <Palette size={12} className="text-slate-400" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 z-50 card p-3 shadow-lg animate-slide-up">
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
            Mode
          </div>
          <div className="grid grid-cols-3 gap-1.5 mb-4">
            {MODES.map((m) => {
              const I = m.icon;
              const selected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-colors ${
                    selected
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200 ring-1 ring-brand-500'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <I size={16} />
                  {m.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
            Accent
          </div>
          <div className="flex gap-2">
            {ACCENTS.map((a) => {
              const selected = accent === a.id;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAccent(a.id)}
                  title={a.label}
                  className={`relative w-8 h-8 rounded-full ${a.swatch} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-all ${
                    selected ? 'ring-slate-900 dark:ring-white scale-110' : 'ring-transparent'
                  }`}
                >
                  {selected && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
