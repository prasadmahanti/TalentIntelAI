import { CheckCircle2, XCircle, MinusCircle } from 'lucide-react';

/**
 * Renders the JD match: percentage, matched/missing/partial skills, and the "Why Not" line.
 */
export default function MatchAnalysis({ result }) {
  if (!result) return null;
  const { percentage, matched, missing, partial, whyNot, seniorityMatch } = result;

  // Static class map — Tailwind's JIT can't see dynamically interpolated class names.
  const toneClasses =
    percentage >= 75
      ? {
          ring: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
          number: 'text-emerald-600 dark:text-emerald-400',
        }
      : percentage >= 55
      ? {
          ring: 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20',
          number: 'text-amber-600 dark:text-amber-400',
        }
      : {
          ring: 'border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20',
          number: 'text-rose-600 dark:text-rose-400',
        };

  return (
    <div className="space-y-4">
      <div className="card p-6">
        <div className="flex items-center gap-6 flex-wrap">
          <div className={`flex flex-col items-center justify-center w-28 h-28 rounded-full border-8 ${toneClasses.ring}`}>
            <div className={`text-3xl font-bold ${toneClasses.number} tabular-nums`}>
              {percentage}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">match</div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-semibold mb-1">Why Not Analysis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{whyNot}</p>
            {seniorityMatch && seniorityMatch.jd !== 'unspecified' && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Seniority — JD: <strong>{seniorityMatch.jd}</strong>, candidate reads as{' '}
                <strong>{seniorityMatch.candidate}</strong>
                {seniorityMatch.penalty > 0 && (
                  <span className="ml-2 text-rose-600 dark:text-rose-400">−{seniorityMatch.penalty} pts</span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <SkillList
          title="Matched"
          icon={<CheckCircle2 size={16} className="text-emerald-500" />}
          tone="success"
          items={matched.map((m) => `${m.skill}${m.recency < 0.6 ? ' (stale)' : ''}`)}
          empty="No direct matches yet."
        />
        <SkillList
          title="Partial / Related"
          icon={<MinusCircle size={16} className="text-amber-500" />}
          tone="warning"
          items={partial.map((p) => `${p.skill} ← via ${p.via}`)}
          empty="No partial matches."
        />
        <SkillList
          title="Missing"
          icon={<XCircle size={16} className="text-rose-500" />}
          tone="danger"
          items={missing}
          empty="Nothing missing — well done!"
        />
      </div>
    </div>
  );
}

function SkillList({ title, icon, tone, items, empty }) {
  const badgeClass =
    tone === 'success' ? 'badge-success' : tone === 'warning' ? 'badge-warning' : 'badge-danger';
  return (
    <div className="card p-4">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
        {icon} {title} <span className="text-slate-400 font-normal">({items.length})</span>
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className={badgeClass}>
              {item}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
