/**
 * Stylable progress bar used both for the upload pipeline and for sub-score breakdowns.
 */
export default function ProgressBar({ value, label, max = 100, tone = 'brand' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500'
      : tone === 'warning'
      ? 'bg-amber-500'
      : tone === 'danger'
      ? 'bg-rose-500'
      : 'bg-brand-500';

  return (
    <div className="w-full">
      {label != null && (
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="text-slate-600 dark:text-slate-300">{label}</span>
          <span className="font-medium tabular-nums">{Math.round(pct)}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${toneClass} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
