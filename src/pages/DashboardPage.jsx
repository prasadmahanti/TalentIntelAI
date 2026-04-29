import { useRef, useMemo } from 'react';
import { Download, Users, Briefcase, Target, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { useResumeStore } from '../store/useResumeStore.js';
import { matchJobDescription } from '../utils/matchJobDescription.js';
import ScoreCard from '../components/ScoreCard.jsx';
import SkillsRadarChart from '../components/SkillsRadarChart.jsx';
import StatCard from '../components/StatCard.jsx';
import RecentActivity from '../components/RecentActivity.jsx';
import HireToggle from '../components/HireToggle.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { exportElementToPdf } from '../utils/exportPDF.js';
import { ROLES, getRole } from '../utils/roleTemplates.js';

export default function DashboardPage() {
  const active = useResumeStore((s) => s.getActiveResume());
  const resumes = useResumeStore((s) => s.resumes);
  const stats = useResumeStore((s) => s.getStats());
  const jdByRole = useResumeStore((s) => s.jdByRole);
  const blind = useResumeStore((s) => s.settings.blindHiring);
  const reportRef = useRef(null);

  const perRole = useMemo(() => {
    const counts = Object.fromEntries(ROLES.map((r) => [r.id, 0]));
    for (const r of resumes) if (r.roleId && counts[r.roleId] != null) counts[r.roleId] += 1;
    return ROLES.map((r) => ({
      role: r.label,
      count: counts[r.id],
      fill: r.id === active?.roleId ? '#3b82f6' : '#94a3b8',
    }));
  }, [resumes, active]);

  const matchResult = useMemo(() => {
    if (!active) return null;
    const jd = active.jobDescription || jdByRole[active.roleId] || '';
    if (!jd) return null;
    return matchJobDescription(active.profile, jd);
  }, [active, jdByRole]);

  const onDownload = async () => {
    try {
      await exportElementToPdf(
        reportRef.current,
        `resume-report-${(active?.profile?.name || 'candidate').replace(/\s+/g, '-')}.pdf`
      );
    } catch (e) {
      alert(`Could not generate PDF: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        {active && (
          <button type="button" onClick={onDownload} className="btn-primary">
            <Download size={16} /> Download PDF Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Resumes Parsed"
          value={stats.totalResumes}
          sub={stats.totalResumes ? 'across all roles' : 'no uploads yet'}
          icon={Users}
          tone="brand"
        />
        <StatCard
          label="Active Jobs"
          value={stats.activeJobs}
          sub={`${stats.activeJobs}/${ROLES.length} roles in play`}
          icon={Briefcase}
          tone="violet"
        />
        <StatCard
          label="Candidates Matched"
          value={stats.matched}
          sub={
            stats.totalResumes
              ? `${Math.round((stats.matched / stats.totalResumes) * 100)}% of pool >= 60%`
              : '60%+ JD match'
          }
          icon={Target}
          tone="emerald"
        />
        <StatCard
          label="Hired"
          value={stats.hired}
          sub={stats.hired ? `${stats.hired} marked hired` : 'none yet'}
          icon={Award}
          tone="amber"
        />
      </div>

      {!active && resumes.length === 0 ? (
        <EmptyState
          title="No resumes yet"
          message="Head to the Upload page, pick a role, and drop a resume to populate this dashboard."
          ctaLabel="Go to Upload"
          ctaTo="/upload"
        />
      ) : (
        <div ref={reportRef} className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="card p-5 lg:col-span-2">
              <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
                Pipeline by Role
              </h3>
              <div style={{ width: '100%', height: 240 }}>
                <ResponsiveContainer>
                  <BarChart data={perRole} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                    <CartesianGrid stroke="currentColor" strokeOpacity={0.15} vertical={false} />
                    <XAxis dataKey="role" tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15,23,42,0.95)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {perRole.map((d, i) => (
                        <Cell key={i} fill={d.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <RecentActivity />
          </div>

          {active && (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ScoreCard score={active.score} />
                <SkillsRadarChart
                  resume={active.score.byCategory}
                  jd={matchResult?.jdByCategory}
                />
              </div>
              <div className="space-y-6">
                <ActiveCandidateCard active={active} blind={blind} />
                {matchResult && (
                  <div className="card p-5">
                    <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-2">
                      JD Match
                    </h3>
                    <p className="text-3xl font-bold text-brand-600 dark:text-brand-300">
                      {matchResult.percentage}%
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {matchResult.whyNot}
                    </p>
                    <Link to="/match" className="btn-ghost text-sm mt-2">
                      Open match details &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveCandidateCard({ active, blind }) {
  const role = getRole(active.roleId);
  return (
    <div className="card p-5">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
        Recent Candidate
      </h3>
      <dl className="space-y-2 text-sm">
        <Row k="Name" v={blind ? '-- hidden --' : active.profile.name || '--'} />
        <Row k="Role" v={role ? role.label : 'unassigned'} />
        <Row k="Email" v={blind ? '-- hidden --' : active.profile.email || '--'} />
        <Row k="Score" v={`${active.score.total} / 100`} />
        <Row k="Match" v={active.matchPercentage != null ? `${active.matchPercentage}%` : '--'} />
        <Row k="Experience" v={`${active.profile.yearsExperience.toFixed(1)} yrs`} />
      </dl>
      <div className="mt-3">
        <HireToggle id={active.id} />
      </div>
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
