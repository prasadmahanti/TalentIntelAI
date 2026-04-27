import React from 'react';
import { X, Briefcase } from 'lucide-react';
import { useRoleStore } from '../../store/useRoleStore.js';

export default function CandidateViewModal({ isOpen, onClose, candidate }) {
  const roles = useRoleStore((s) => s.roles);
  if (!isOpen || !candidate) return null;

  const targetRole = roles.find(r => r.id === candidate.targetRole);
  const roleColor = targetRole?.color || 'brand';

  const hexMap = {
    brand: '#3b82f6', emerald: '#10b981', violet: '#8b5cf6',
    amber: '#f59e0b', rose: '#f43f5e', sky: '#0ea5e9', orange: '#f97316'
  };

  const currentHex = hexMap[roleColor] || hexMap.brand;

  const renderField = (label, value, isStatus = false) => (
    <div className="flex flex-col mb-4">
      <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </span>
      {isStatus ? (
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
            ${value === 'Selected' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : ''}
            ${value === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' : ''}
            ${value === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : ''}`}
          >
            {value}
          </span>
        </div>
      ) : (
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          {value || '-'}
        </span>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-sm transition-colors duration-500"
              style={{ backgroundColor: currentHex }}
            >
              {candidate.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {candidate.fullName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 border-b border-slate-200 dark:border-slate-800">

          {/* Login & Role Credentials */}
          <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800/50 transition-colors duration-500">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 mb-3 flex items-center gap-2">
              <Briefcase size={12} /> Login & Role Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500">Target Role</span>
                <div className="mt-1">
                  {targetRole ? (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold text-white uppercase"
                      style={{ backgroundColor: currentHex }}
                    >
                      {targetRole.label}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-slate-400">-</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500">Username</span>
                <p className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{candidate.username || '-'}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500">Password</span>
                <p className="text-sm font-mono text-slate-900 dark:text-slate-100 mt-0.5 tracking-widest">{'•'.repeat(candidate.password?.length || 8)}</p>
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-slate-500">User Type</span>
                <div className="mt-1">
                  {candidate.userType === 'admin' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">Admin</span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20">User</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
            
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Profile</h3>
              {renderField('Phone Number', candidate.phone)}
              {renderField('Gender', candidate.gender)}
              {renderField('Date of Birth', candidate.dob)}
              {renderField('Status', candidate.status, true)}
              {renderField('Skills', candidate.skills)}
              {renderField('Resume Attached', candidate.resumeName)}
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Experience & Onboarding</h3>
              {renderField('Qualification', candidate.qualification)}
              {renderField('Total Experience (Yrs)', candidate.experience)}
              {renderField('HR Experience (Yrs)', candidate.hrExperience)}
              {renderField('Current Company', candidate.currentCompany)}
              {renderField('Expected Salary (LPA)', candidate.expectedSalary)}
              {renderField('Notice Period (Days)', candidate.noticePeriod)}
              {renderField('Joining Date', candidate.joiningDate)}
            </div>

          </div>

          <div className="mt-4">
               <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Location & Remarks</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                 <div>
                    {renderField('Address', candidate.address)}
                    {renderField('City', candidate.city)}
                    {renderField('State', candidate.state)}
                    {renderField('Country', candidate.country)}
                    {renderField('Pincode', candidate.pincode)}
                 </div>
                 <div>
                    {renderField('Remarks/Notes', candidate.remarks)}
                 </div>
               </div>
          </div>
        </div>

      </div>
    </div>
  );
}
