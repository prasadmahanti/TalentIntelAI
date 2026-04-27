import { useRoleStore } from '../store/useRoleStore.js';

const COLOR = {
  brand:   { active: 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-200',       icon: 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300' },
  emerald: { active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200', icon: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300' },
  violet:  { active: 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200',   icon: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300' },
  amber:   { active: 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200',         icon: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300' },
  rose:    { active: 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200',             icon: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300' },
  sky:     { active: 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-200',                 icon: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-300' },
  orange:  { active: 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200',   icon: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300' },
};

export default function RoleSelector({ value, onChange }) {
  // Pull roles from the dynamic store — any role an admin creates appears here automatically
  const roles = useRoleStore((s) => s.roles);

  if (!roles.length) {
    return (
      <div className="text-sm text-slate-400 py-4">
        No roles defined yet. Ask an admin to create roles in Role Management.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {roles.map((role) => {
        const colors = COLOR[role.color] || COLOR.brand;
        const selected = value === role.id;
        const initial = role.label?.charAt(0).toUpperCase() || '?';

        return (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`card p-4 text-left transition-all border-2 hover:shadow-md ${
              selected
                ? colors.active
                : 'border-transparent text-slate-700 dark:text-slate-200'
            }`}
          >
            {/* Colored initial avatar replacing the static icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 font-bold text-base ${colors.icon}`}>
              {initial}
            </div>
            <div className="font-semibold text-sm">{role.label}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {role.description || 'No description'}
            </div>
            {/* Skill count badge */}
            {role.skills && (
              <div className="mt-2 text-xs text-slate-400">
                {role.skills.split(',').filter(Boolean).length} skills
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
