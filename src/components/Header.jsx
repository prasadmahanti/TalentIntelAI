import { useState, useRef, useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore.js';
import { useAuthStore } from '../store/useAuthStore.js';
import ThemeToggle from './ThemeToggle.jsx';
import { EyeOff, Eye, Trash2, LogOut, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Top header bar — shows the active resume's name (or fallback), plus the global
 * Blind Hiring toggle, theme toggle, and User Profile menu.
 */
export default function Header() {
  const active = useResumeStore((s) => s.getActiveResume());
  const settings = useResumeStore((s) => s.settings);
  const updateSettings = useResumeStore((s) => s.updateSettings);
  const clearAll = useResumeStore((s) => s.clearAll);
  
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = settings.blindHiring
    ? 'Anonymous Candidate'
    : active?.profile?.name || active?.fileName || 'No resume loaded';
    
  // Faux avatar extraction
  const email = user?.email || 'User';
  const initial = email.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 relative z-50">
      <div className="min-w-0">
        <div className="text-sm text-slate-500 dark:text-slate-400">Active resume</div>
        <div className="font-semibold truncate">{displayName}</div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => updateSettings({ blindHiring: !settings.blindHiring })}
          className={`btn ${settings.blindHiring ? 'btn-primary' : 'btn-secondary'}`}
          title="Hide names, contact info, and gender-coded language"
        >
          {settings.blindHiring ? <EyeOff size={16} /> : <Eye size={16} />}
          <span className="hidden sm:inline">{settings.blindHiring ? 'Blind hiring on' : 'Blind hiring off'}</span>
        </button>

        <ThemeToggle />

        <button
          type="button"
          onClick={() => {
            if (confirm('Remove all resumes from this browser? This cannot be undone.')) clearAll();
          }}
          className="btn-ghost"
          title="Clear all data"
        >
          <Trash2 size={16} />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center h-9 w-9 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 text-white font-bold shadow-sm shadow-brand-500/30 hover:scale-105 transition-transform"
            title="Profile Menu"
          >
            {initial}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserCircle className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
