import { useResumeStore } from '../store/useResumeStore.js';
import ScoreCard from '../components/ScoreCard.jsx';
import SkillsRadarChart from '../components/SkillsRadarChart.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

/**
 * Detailed single-resume analysis view.
 * Shows full breakdown, sub-scores, every detected skill (with recency), education, certs, soft skills.
 */
export default function AnalysisPage() {
  const active = useResumeStore((s) => s.getActiveResume());
  const blind = useResumeStore((s) => s.settings.blindHiring);

  if (!active) {
    return <EmptyState title="No resume to analyze" />;
  }

  const { profile, score } = active;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resume Analysis</h1>
          {active.roleId && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium">
              <span>Target Role Selected: </span>
              <span className="uppercase tracking-wider font-bold">{active.roleId}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScoreCard score={score} title="ATS Baseline Score" />
            {active.matchPercentage !== null && (
              <div className="card p-6 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-brand-50 dark:from-indigo-950/20 dark:to-brand-900/20 border-brand-200 dark:border-brand-800">
                <h3 className="text-sm uppercase tracking-wide text-brand-600 dark:text-brand-400 font-bold mb-4 text-center">
                  Role Alignment Score
                </h3>
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                    <circle cx="70" cy="70" r="56" className="stroke-white dark:stroke-slate-900" strokeWidth="10" fill="none" />
                    <circle
                      cx="70"
                      cy="70"
                      r="56"
                      className={`${active.matchPercentage >= 70 ? 'stroke-emerald-500' : active.matchPercentage >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'} transition-all duration-700`}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray={2 * Math.PI * 56}
                      strokeDashoffset={2 * Math.PI * 56 - (active.matchPercentage / 100) * (2 * Math.PI * 56)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-3xl font-bold tabular-nums text-brand-900 dark:text-brand-100">{Math.round(active.matchPercentage)}</div>
                    <div className="text-xs text-brand-600/70 dark:text-brand-400/70">/ 100</div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-center text-slate-500 dark:text-slate-400">
                  Calculated against the specified Job Description. See the <b>JD Match</b> tab for details.
                </p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">
              Sub-scores
            </h3>
            <div className="space-y-4">
              <ProgressBar
                label="Formatting"
                value={score.subscores.formatting}
                tone={toneFor(score.subscores.formatting)}
              />
              <ProgressBar
                label="Keyword density"
                value={score.subscores.keywords}
                tone={toneFor(score.subscores.keywords)}
              />
              <ProgressBar
                label="Experience clarity"
                value={score.subscores.experience}
                tone={toneFor(score.subscores.experience)}
              />
              <ProgressBar
                label="Skills relevance (recency-weighted)"
                value={score.subscores.skillsRelevance}
                tone={toneFor(score.subscores.skillsRelevance)}
              />
            </div>
          </div>

          <SkillsRadarChart resume={score.byCategory} />

          <SkillsList skills={profile.skills} />
        </div>

        <div className="space-y-6">
          <ProfileFacts profile={profile} blind={blind} />
          <ListCard title="Education" items={profile.education.map((e) => e.degree)} empty="No education detected." />
          <ListCard title="Certifications" items={profile.certifications} empty="No certifications detected." />
          <ListCard title="Soft Skills" items={profile.softSkills} empty="No soft skills detected." />
        </div>
      </div>
    </div>
  );
}

function toneFor(v) {
  if (v >= 75) return 'success';
  if (v >= 55) return 'warning';
  return 'danger';
}

function ProfileFacts({ profile, blind }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
        Profile
      </h3>
      <dl className="space-y-2 text-sm">
        <Row k="Name" v={blind ? '— hidden —' : profile.name || '—'} />
        <Row k="Email" v={blind ? '— hidden —' : profile.email || '—'} />
        <Row k="Location" v={profile.location || '—'} />
        <Row k="Years of experience" v={profile.yearsExperience.toFixed(1)} />
        <Row k="Word count" v={profile.wordCount} />
        <Row k="Coded language hits" v={profile.codedHits.length || 0} />
      </dl>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
      <dd className="font-medium text-right truncate">{v}</dd>
    </div>
  );
}

function ListCard({ title, items, empty }) {
  return (
    <div className="card p-5">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">{empty}</p>
      ) : (
        <ul className="text-sm space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="leading-relaxed">• {it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SkillsList({ skills }) {
  if (skills.length === 0) {
    return (
      <div className="card p-5">
        <p className="text-sm text-slate-500">No skills detected. Make sure your resume has a Skills section.</p>
      </div>
    );
  }
  // Sort by recency descending so the most-current skills appear first.
  const sorted = [...skills].sort((a, b) => (b.recency ?? 0) - (a.recency ?? 0));
  return (
    <div className="card p-5">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
        Skills detected ({skills.length})
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((s) => {
          const recencyClass =
            (s.recency ?? 0) >= 1 ? 'badge-success' : (s.recency ?? 0) >= 0.5 ? 'badge-neutral' : 'badge-warning';
          const label =
            (s.recency ?? 0) < 0.5 ? `${s.name} · stale` : (s.recency ?? 0) >= 1 ? `${s.name} · recent` : s.name;
          return (
            <span key={s.name} className={recencyClass} title={`Recency weight: ${(s.recency ?? 0).toFixed(2)}`}>
              {label}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-3">
        <strong>Recent</strong> = used within the last 2 years. <strong>Stale</strong> = last touched 5+ years ago.
      </p>
    </div>
  );
}
