/**
 * Headline KPI card used on the dashboard top row.
 * Static color classes per `tone` so Tailwind's JIT can see them.
 */
const TONES = {
  brand:   { ring: 'bg-brand-50 dark:bg-brand-900/30',     text: 'text-brand-600 dark:text-brand-300' },
  emerald: { ring: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-300' },
  violet:  { ring: 'bg-violet-50 dark:bg-violet-900/30',   text: 'text-violet-600 dark:text-violet-300' },
  amber:   { ring: 'bg-amber-50 dark:bg-amber-900/30',     text: 'text-amber-600 dark:text-amber-300' },
  rose:    { ring: 'bg-rose-50 dark:bg-rose-900/30',       text: 'text-rose-600 dark:text-rose-300' },
};

export default function StatCard({ label, value, sub, icon: Icon, tone = 'brand' }) {
  const t = TONES[tone] ?? TONES.brand;
  return (
    <div className="card p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.ring} ${t.text} flex-shrink-0`}>
        {Icon ? <Icon size={22} /> : null}
      </div>
      <div className="min-w-0">
        <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
          {label}
        </div>
        <div className={`text-2xl font-bold tabular-nums ${t.text}`}>{value}</div>
        {sub && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}
