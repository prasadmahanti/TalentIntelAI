import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Filter,
} from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore.js';
import { matchJobDescription } from '../utils/matchJobDescription.js';
import { ROLES, getRole } from '../utils/roleTemplates.js';
import HireToggle from '../components/HireToggle.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

/**
 * Rankings page — sorts every uploaded resume by JD-match% and lets the recruiter expand
 * each row to see exactly which skills matched, partial-matched, and which are missing.
 *
 * Match % is computed live against the current per-role JD (from `jdByRole`), not the
 * stale snapshot stored on the resume at upload time, so editing a JD on the Upload page
 * immediately re-ranks every candidate for that role.
 */
export default function RankingsPage() {
  const resumes = useResumeStore((s) => s.resumes);
  const jdByRole = useResumeStore((s) => s.jdByRole);
  const blind = useResumeStore((s) => s.settings.blindHiring);
  const setActive = useResumeStore((s) => s.setActiveResume);
  const navigate = useNavigate();

  const [filterRole, setFilterRole] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Compute live match for every resume against its current role JD.
  const ranked = useMemo(() => {
    const list = resumes
      .filter((r) => filterRole === 'all' || r.roleId === filterRole)
      .map((r) => {
        const jd = (r.roleId && jdByRole[r.roleId]) || r.jobDescription || '';
        const match = jd ? matchJobDescription(r.profile, jd) : null;
        return { resume: r, match };
      });
    // Sort by match % descending; resumes without a JD sink to the bottom.
    list.sort((a, b) => {
      const pa = a.match?.percentage ?? -1;
      const pb = b.match?.percentage ?? -1;
      return pb - pa;
    });
    return list;
  }, [resumes, jdByRole, filterRole]);

  if (resumes.length === 0) {
    return (
      <EmptyState
        title="No candidates to rank yet"
        message="Upload a few resumes against a role and they'll show up here, sorted by match %."
        ctaLabel="Go to Upload"
        ctaTo="/upload"
      />
    );
  }

  const onOpenAnalysis = (id) => {
    setActive(id);
    navigate('/analysis');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={22} className="text-amber-500" />
            Rankings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Live ranking of {ranked.length} candidate{ranked.length === 1 ? '' : 's'} by JD-match.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input py-1.5"
          >
            <option value="all">All roles</option>
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <tr>
                <th className="text-left p-3 w-12">#</th>
                <th className="text-left p-3">Candidate</th>
                <th className="text-left p-3 hidden md:table-cell">Role</th>
                <th className="text-left p-3 w-44">Match %</th>
                <th className="text-left p-3 hidden lg:table-cell w-24">Score</th>
                <th className="text-left p-3 hidden lg:table-cell w-24">Years</th>
                <th className="text-right p-3 w-44">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {ranked.map(({ resume, match }, i) => {
                const role = getRole(resume.roleId);
                const name = blind
                  ? `Candidate #${resume.id.slice(-4).toUpperCase()}`
                  : resume.profile?.name || resume.fileName;
                const pct = match?.percentage ?? null;
                const tone = pct == null ? 'danger' : pct >= 75 ? 'success' : pct >= 55 ? 'warning' : 'danger';
                const isExpanded = expandedId === resume.id;

                return (
                  <Fragment key={resume.id}>
                    <tr
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : resume.id)}
                    >
                      <td className="p-3 font-bold tabular-nums text-slate-400">
                        {i + 1}
                      </td>
                      <td className="p-3">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {resume.profile.email && !blind ? resume.profile.email : resume.fileName}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-slate-600 dark:text-slate-300">
                        {role ? role.label : <span className="text-slate-400">unassigned</span>}
                      </td>
                      <td className="p-3">
                        {pct == null ? (
                          <span className="text-xs text-slate-400">no JD</span>
                        ) : (
                          <ProgressBar value={pct} tone={tone} label={null} />
                        )}
                        {pct != null && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {match.matched.length} matched · {match.partial.length} partial · {match.missing.length} missing
                          </div>
                        )}
                      </td>
                      <td className="p-3 hidden lg:table-cell font-medium tabular-nums">
                        {resume.score?.total ?? '—'}
                      </td>
                      <td className="p-3 hidden lg:table-cell tabular-nums">
                        {resume.profile.yearsExperience.toFixed(1)}
                      </td>
                      <td className="p-3 text-right">
                        <div
                          className="inline-flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HireToggle id={resume.id} size="sm" />
                          <button
                            type="button"
                            onClick={() => onOpenAnalysis(resume.id)}
                            className="btn-ghost text-xs"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : resume.id)}
                            className="btn-ghost text-xs"
                            aria-label={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-slate-900/40">
                        <td colSpan={7} className="p-4">
                          <RankingDetail resume={resume} match={match} role={role} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Expanded row — shows the matched/partial/missing skill lists, plus a "Why Not" line and
 * a recency-tagged view of every detected skill on the resume.
 */
function RankingDetail({ resume, match, role }) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <SkillBlock
        title="Matched"
        tone="success"
        icon={<CheckCircle2 size={14} className="text-emerald-500" />}
        items={
          match
            ? match.matched.map((m) => ({
                label: m.skill,
                meta: m.recency >= 1 ? 'recent' : m.recency >= 0.5 ? 'mid' : 'stale',
              }))
            : []
        }
      />
      <SkillBlock
        title="Partial / Related"
        tone="warning"
        icon={<MinusCircle size={14} className="text-amber-500" />}
        items={
          match
            ? match.partial.map((p) => ({
                label: p.skill,
                meta: `via ${p.via}`,
              }))
            : []
        }
      />
      <SkillBlock
        title="Missing"
        tone="danger"
        icon={<XCircle size={14} className="text-rose-500" />}
        items={match ? match.missing.map((m) => ({ label: m })) : []}
      />

      <div className="lg:col-span-3 card p-4">
        <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
          Why this rank
        </h4>
        <p className="text-sm">
          {match
            ? match.whyNot
            : `No JD has been set for the ${role?.label || 'unassigned'} role yet — go to the Upload page and pick a role to score this candidate.`}
        </p>
        {match && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Seniority: JD asks for <strong>{match.seniorityMatch?.jd ?? 'unspecified'}</strong>,
            candidate reads as <strong>{match.seniorityMatch?.candidate ?? 'unspecified'}</strong>
            {match.seniorityMatch?.penalty > 0 && (
              <span className="text-rose-600 dark:text-rose-400 ml-2">
                −{match.seniorityMatch.penalty} pts
              </span>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-3 card p-4">
        <h4 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
          All detected skills ({resume.profile.skills.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[...resume.profile.skills]
            .sort((a, b) => (b.recency ?? 0) - (a.recency ?? 0))
            .map((s) => {
              const cls =
                (s.recency ?? 0) >= 1
                  ? 'badge-success'
                  : (s.recency ?? 0) >= 0.5
                  ? 'badge-neutral'
                  : 'badge-warning';
              return (
                <span key={s.name} className={cls} title={`Recency: ${(s.recency ?? 0).toFixed(2)}`}>
                  {s.name}
                </span>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function SkillBlock({ title, icon, tone, items }) {
  const badgeClass =
    tone === 'success' ? 'badge-success' : tone === 'warning' ? 'badge-warning' : 'badge-danger';
  return (
    <div className="card p-4">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
        {icon} {title}
        <span className="text-slate-400 font-normal">({items.length})</span>
      </h4>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400">—</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className={badgeClass}>
              {item.label}
              {item.meta ? <span className="opacity-70 ml-1">· {item.meta}</span> : null}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
