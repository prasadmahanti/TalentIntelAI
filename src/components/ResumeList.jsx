import { useResumeStore } from '../store/useResumeStore.js';
import { FileText, Trash2, Eye } from 'lucide-react';

/**
 * A compact list of all uploaded resumes — selecting one swaps the active resume.
 */
export default function ResumeList() {
  const resumes = useResumeStore((s) => s.resumes);
  const activeId = useResumeStore((s) => s.activeResumeId);
  const setActive = useResumeStore((s) => s.setActiveResume);
  const remove = useResumeStore((s) => s.removeResume);
  const blind = useResumeStore((s) => s.settings.blindHiring);

  if (resumes.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No resumes uploaded yet.</p>
    );
  }

  return (
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {resumes.map((r) => {
        const name = blind ? `Candidate #${shortId(r.id)}` : r.profile?.name || r.fileName;
        const isActive = r.id === activeId;
        return (
          <li
            key={r.id}
            className={`flex items-center gap-3 py-3 px-1 ${
              isActive ? 'bg-brand-50/50 dark:bg-brand-900/20 rounded-lg px-3' : ''
            }`}
          >
            <FileText size={18} className="text-slate-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Score {r.score?.total ?? '-'} • {(r.profile?.skills?.length ?? 0)} skills • {new Date(r.uploadedAt).toLocaleDateString()}
              </div>
            </div>
            <button
              type="button"
              className="btn-ghost p-1.5"
              onClick={() => setActive(r.id)}
              title="Make active"
            >
              <Eye size={16} />
            </button>
            <button
              type="button"
              className="btn-ghost p-1.5 text-rose-500"
              onClick={() => remove(r.id)}
              title="Remove"
            >
              <Trash2 size={16} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function shortId(id) {
  return id.slice(-4).toUpperCase();
}
