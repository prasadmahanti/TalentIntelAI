import React from 'react';
import { Edit2, Eye, Trash2, ArrowUpDown } from 'lucide-react';
import { useRoleStore } from '../../store/useRoleStore.js';

export default function CandidateTable({ 
  candidates, 
  onEdit, 
  onView, 
  onDelete, 
  requestSort, 
  sortConfig 
}) {
  const roles = useRoleStore((s) => s.roles);

  const getSortIcon = (name) => {
    if (!sortConfig || sortConfig.key !== name) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return <ArrowUpDown className={`w-3 h-3 text-brand-600 ${sortConfig.direction === 'ascending' ? '' : 'rotate-180'}`} />;
  };

  const renderSortableHeader = (label, sortKey) => (
    <th 
      className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
      onClick={() => requestSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {label}
        {getSortIcon(sortKey)}
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl">
      <table className="w-full whitespace-nowrap">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <tr>
            {renderSortableHeader('Name', 'fullName')}
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Type</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Qualification</th>
            {renderSortableHeader('Experience', 'experience')}
            {renderSortableHeader('Joining Date', 'joiningDate')}
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {candidates.length > 0 ? (
            candidates.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs mr-3">
                      {c.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">{c.fullName}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-white">{c.email}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{c.phone}</div>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-300">
                  {c.username || '-'}
                </td>
                <td className="px-6 py-4">
                  {c.userType === 'admin' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">Admin</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20">User</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {c.qualification || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {c.experience ? `${c.experience} Yrs` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                  {c.joiningDate || '-'}
                </td>
                <td className="px-6 py-4">
                  {c.targetRole ? (
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {roles.find(r => r.id === c.targetRole)?.label || '-'}
                    </span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${c.status === 'Selected' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' : ''}
                    ${c.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' : ''}
                    ${c.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' : ''}`}
                  >
                    {c.status || 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onView(c)} 
                      className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-md transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => onEdit(c)} 
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                      title="Edit Candidate"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(c.id)} 
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                      title="Delete Candidate"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                No candidates found. Click 'Add Candidate' to register someone.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
