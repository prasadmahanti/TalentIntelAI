import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, BarChart3, Target, Sparkles, FileText, Trophy } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/analysis', label: 'Analysis', icon: BarChart3 },
  { to: '/match', label: 'JD Match', icon: Target },
  { to: '/rankings', label: 'Rankings', icon: Trophy },
  { to: '/suggestions', label: 'Suggestions', icon: Sparkles },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-center gap-2 px-2 py-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white">
          <FileText size={20} />
        </div>
        <div>
          <div className="font-bold text-sm"> TalentIntel AI</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">AI-powered, on-device</div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-200">
        <strong>Privacy note:</strong> Files are parsed locally in your browser. Nothing is uploaded.
      </div>
    </aside>
  );
}
