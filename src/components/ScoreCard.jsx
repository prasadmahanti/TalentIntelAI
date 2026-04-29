import ProgressBar from './ProgressBar.jsx';

/**
 * Headline ATS score card — big number on the left, bucket breakdown on the right.
 *
 * Props:
 *   - score: object returned by scoreResume()
 *   - title: optional override
 */
export default function ScoreCard({ score, title = 'Talent Fit Score' }) {
  const total = score?.total ?? 0;
  const tone = total >= 75 ? 'success' : total >= 55 ? 'warning' : 'danger';
  const ringColor =
    tone === 'success' ? 'stroke-emerald-500' : tone === 'warning' ? 'stroke-amber-500' : 'stroke-rose-500';

  // Score ring math: one big circle.
  const r = 56;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (total / 100) * circumference;

  return (
    <div className="card p-6">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
        {title}
      </h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-center">
        <div className="relative w-36 h-36 mx-auto sm:mx-0">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r={r} className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="10" fill="none" />
            <circle
              cx="70"
              cy="70"
              r={r}
              className={`${ringColor} transition-all duration-700`}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-nums">{total}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">/ 100</div>
          </div>
        </div>

        <div className="space-y-3">
          <BreakdownRow label="Hard Skills (50%)" value={score.breakdown.hardSkills} />
          <BreakdownRow label="Experience (30%)" value={score.breakdown.experience} />
          <BreakdownRow label="Education (10%)" value={score.breakdown.education} />
          <BreakdownRow label="Soft Skills (10%)" value={score.breakdown.softSkills} />
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }) {
  return (
    <ProgressBar
      label={label}
      value={value}
      tone={value >= 75 ? 'success' : value >= 55 ? 'warning' : 'danger'}
    />
  );
}
