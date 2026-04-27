import React from 'react';
import { Edit2, Eye, Trash2 } from 'lucide-react';

function hexFor(color) {
  const map = { brand: '#6366f1', emerald: '#10b981', violet: '#7c3aed', amber: '#f59e0b', rose: '#f43f5e', sky: '#0ea5e9', orange: '#f97316' };
  return map[color] || '#6366f1';
}

export default function RoleTable({ roles, onEdit, onView, onDelete }) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <table className="w-full whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Skills</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">JD</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {roles.length > 0 ? (
            roles.map((role) => {
              const skills = role.skills
                ? role.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
              const hex = hexFor(role.color);

              return (
                <tr key={role.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                  {/* Role Name */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        style={{ backgroundColor: hex }}
                      >
                        {role.label?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{role.label}</div>
                        <div className="text-xs text-slate-400">{role.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Skills */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {skills.slice(0, 4).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full font-medium"
                          style={{ backgroundColor: `${hex}15`, color: hex, border: `1px solid ${hex}30` }}
                        >
                          {s}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          +{skills.length - 4} more
                        </span>
                      )}
                      {skills.length === 0 && (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </div>
                  </td>

                  {/* Description */}
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                    <span className="line-clamp-2">{role.description || '—'}</span>
                  </td>

                  {/* JD Status */}
                  <td className="px-6 py-4">
                    {role.jobDescription ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
                        Defined
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                        Empty
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onView(role)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors"
                        title="View Role"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(role)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(role.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        title="Delete Role"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-16 text-center text-slate-400 text-sm">
                No roles found. Click <strong>Create Role</strong> to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
