import { useResumeStore } from '../store/useResumeStore.js';
import { getRole, getDefaultJd } from '../utils/roleTemplates.js';
import RoleSelector from '../components/RoleSelector.jsx';
import ResumeUploader from '../components/ResumeUploader.jsx';
import ResumeList from '../components/ResumeList.jsx';
import { RotateCcw } from 'lucide-react';

export default function UploadPage() {
  const activeRoleId = useResumeStore((s) => s.activeRoleId);
  const setActiveRole = useResumeStore((s) => s.setActiveRole);
  const jdByRole = useResumeStore((s) => s.jdByRole);
  const setJdForRole = useResumeStore((s) => s.setJdForRole);
  const resetJdForRole = useResumeStore((s) => s.resetJdForRole);

  const role = getRole(activeRoleId);
  const jd = activeRoleId ? jdByRole[activeRoleId] ?? getDefaultJd(activeRoleId) : '';

  const onChangeRole = (id) => {
    setActiveRole(id);
    if (!jdByRole[id]) setJdForRole(id, getDefaultJd(id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Upload a Resume</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pick the role you're hiring for, tweak the JD, then drop a resume.
        </p>
      </div>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
          1. Choose a role
        </h2>
        <RoleSelector value={activeRoleId} onChange={onChangeRole} />
      </section>

      {role && (
        <section className="grid lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
                2. Edit Job Description ({role.label})
              </h2>
              <button
                type="button"
                onClick={() => resetJdForRole(role.id)}
                className="btn-ghost text-xs"
                title="Reset to the default template"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>
            <textarea
              value={jd}
              onChange={(e) => setJdForRole(role.id, e.target.value)}
              className="input min-h-[360px] font-mono text-sm leading-relaxed"
              placeholder="Job description..."
            />
            <p className="text-xs text-slate-400 mt-2">
              Saved automatically per role - your edits survive page reloads.
            </p>
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
              3. Upload Resume
            </h2>
            <ResumeUploader roleId={role.id} jobDescription={jd} />
          </div>
        </section>
      )}

      <section className="card p-5">
        <h2 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3">
          Resumes in this session
        </h2>
        <ResumeList />
      </section>
    </div>
  );
}
