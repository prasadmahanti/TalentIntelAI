import { User, Mail, ShieldCheck, CalendarRange, Clock } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function MyProfilePage() {
  const { user } = useAuthStore();
  // Provide fallbacks just in case
  const email = user?.email || 'Unknown User';
  const role = user?.role || 'user';
  
  // Extract a faux generic name from the email (e.g., admin1@example.com -> Admin 1)
  const nameParts = email.split('@')[0].match(/[a-zA-Z]+|[0-9]+/g) || ['Current User'];
  const formattedName = nameParts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Background glow for aesthetics */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-brand-500 to-purple-500 flex items-center justify-center shadow-lg text-white font-bold text-4xl shadow-brand-500/30">
            {formattedName.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {formattedName}
            </h1>
            <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium text-sm rounded-full border border-brand-200 dark:border-brand-500/20">
              <ShieldCheck className="w-4 h-4" />
              {role === 'admin' ? 'System Administrator' : 'Standard User'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-500" />
            Account Details
          </h2>
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <Mail className="w-4 h-4 text-slate-400" />
                {email}
              </div>
            </div>
            
            <div className="flex flex-col pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Member Since</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                <CalendarRange className="w-4 h-4 text-slate-400" />
                Just now (Demo Session)
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" />
            Security & Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <div className="mt-0.5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Multi-Factor Authentication</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {role === 'admin' ? 'Disabled for Administrators' : 'Enabled and verified on this device'}
                </p>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Current Session</span>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium text-sm">
                Active — IP Authenticated
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
