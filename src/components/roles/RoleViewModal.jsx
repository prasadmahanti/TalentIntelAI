import React from 'react';
import { X, Briefcase, FileText } from 'lucide-react';

export default function RoleViewModal({ isOpen, onClose, role }) {
  if (!isOpen || !role) return null;

  const skills = role.skills
    ? role.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 rounded-t-2xl"
          style={{ background: `linear-gradient(135deg, ${hexFor(role.color)}15, ${hexFor(role.color)}05)` }}>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: hexFor(role.color) }}>
              <Briefcase size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{role.label}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{role.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Skills Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Target Skills ({skills.length})
            </h3>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-sm rounded-full border font-medium"
                    style={{
                      backgroundColor: `${hexFor(role.color)}15`,
                      borderColor: `${hexFor(role.color)}40`,
                      color: hexFor(role.color),
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills defined for this role.</p>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <FileText size={14} />
              Default Job Description
            </h3>
            {role.jobDescription ? (
              <pre className="text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto">
                {role.jobDescription}
              </pre>
            ) : (
              <p className="text-sm text-slate-400">No job description defined.</p>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>ID: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{role.id}</code></span>
            {role.createdAt && <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function hexFor(color) {
  const map = { brand: '#6366f1', emerald: '#10b981', violet: '#7c3aed', amber: '#f59e0b', rose: '#f43f5e', sky: '#0ea5e9', orange: '#f97316' };
  return map[color] || '#6366f1';
}
