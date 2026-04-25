import { useMemo } from 'react';
import { useResumeStore } from '../store/useResumeStore.js';
import { matchJobDescription } from '../utils/matchJobDescription.js';
import MatchAnalysis from '../components/MatchAnalysis.jsx';
import SkillsRadarChart from '../components/SkillsRadarChart.jsx';
import RoleSelector from '../components/RoleSelector.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { getRole, getDefaultJd } from '../utils/roleTemplates.js';
import { RotateCcw } from 'lucide-react';

/**
 * JD Match page.
 *
 * The JD shown here is bound to the currently selected role on the Upload page (via
 * `activeRoleId` + `jdByRole`). Selecting a role on Upload — or right here on this
 * page — immediately swaps the JD; editing the JD here saves it back per-role, so the
 * Upload page sees the same text. If no role is selected, the page falls back to a
 * free-form `jobDescription` slot so it still works in isolation.
 */
export default function MatchPage() {
  const active = useResumeStore((s) => s.getActiveResume());
  const activeRoleId = useResumeStore((s) => s.activeRoleId);
  const setActiveRole = useResumeStore((s) => s.setActiveRole);
  const jdByRole = useResumeStore((s) => s.jdByRole);
  const setJdForRole = useResumeStore((s) => s.setJdForRole);
  const resetJdForRole = useResumeStore((s) => s.resetJdForRole);
  const freeformJd = useResumeStore((s) => s.jobDescription);
  const setFreeformJd = useResumeStore((s) => s.setJobDescription);

  const role = getRole(activeRoleId);
  const jd = role ? jdByRole[role.id] ?? getDefaultJd(role.id) : freeformJd;
  const setJd = role ? (text) => setJdForRole(role.id, text) : setFreeformJd;

  const result = useMemo(() => {
    if (!active) return null;
    return matchJobDescription(active.profile, jd);
  }, [active, jd]);

  if (!active) {
    return <EmptyState title="Upload a resume to start matching" />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Job Description Match</h1>
        {role && (
          <button
            type="button"
            onClick={() => resetJdForRole(role.id)}
            className="btn-ghost text-sm"
            title="Reset this role's JD to the default template"
          >
            <RotateCcw size={14} /> Reset JD
          </button>
        )}
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
          Pick a role (shared with Upload page)
        </h2>
        <RoleSelector value={activeRoleId} onChange={setActiveRole} />
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <label className="block text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
            {role ? `Job description (${role.label})` : 'Job description (free-form)'}
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full JD here..."
            className="input min-h-[280px] font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-slate-400 mt-2">
            {role
              ? `Saved per role — your edits sync with the Upload page and re-rank candidates instantly.`
              : `Pick a role above to use the editable per-role JD that the Upload page also uses.`}
          </p>
        </div>

        <SkillsRadarChart resume={result?.resumeByCategory ?? {}} jd={result?.jdByCategory} />
      </div>

      {result && jd && <MatchAnalysis result={result} />}
    </div>
  );
}
