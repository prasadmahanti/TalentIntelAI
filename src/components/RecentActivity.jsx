import { FileText, Clock } from 'lucide-react';
import { useResumeStore } from '../store/useResumeStore.js';
import { getRole } from '../utils/roleTemplates.js';

/**
 * Compact list of the most-recently-uploaded resumes.
 * Shows: candidate name (or anon under Blind Hiring), role, score, and time-ago.
 */
export default function RecentActivity({ limit = 6 }) {
  const resumes = useResumeStore((s) => s.resumes);
  const blind = useResumeStore((s) => s.settings.blindHiring);
  const setActive = useResumeStore((s) => s.setActiveResume);

  const sorted = [...resumes]
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
    .slice(0, limit);

  return (
    <div className="card p-5">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3 flex items-center gap-2">
        <Clock size={14} /> Recent Parser Activity
      </h3>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No resumes parsed yet.</p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
          {sorted.map((r) => {
            const name = blind
              ? `Candidate #${r.id.slice(-4).toUpperCase()}`
              : r.profile?.name || r.fileName;
            const role = getRole(r.roleId);
            const score = r.score?.total ?? 0;
            const tone =
              score >= 75 ? 'badge-success' : score >= 55 ? 'badge-warning' : 'badge-danger';
            return (
              <li key={r.id} className="py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 flex-shrink-0">
                  <FileText size={16} />
                </div>
                <button
                  type="button"
                  onClick={() => setActive(r.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="font-medium truncate text-sm">{name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {role ? role.label : 'No role'} - {timeAgo(r.uploadedAt)}
                  </div>
                </button>
                <span className={tone}>{score}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return 'just now';
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
