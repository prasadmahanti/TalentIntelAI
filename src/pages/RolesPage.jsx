import React, { useState, useMemo } from 'react';
import { PlusCircle, Search, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import { useRoleStore } from '../store/useRoleStore';
import RoleTable from '../components/roles/RoleTable';
import RoleFormModal from '../components/roles/RoleFormModal';
import RoleViewModal from '../components/roles/RoleViewModal';

const PER_PAGE = 10;

export default function RolesPage() {
  const { roles, addRole, updateRole, deleteRole } = useRoleStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const handleSave = (data) => {
    if (editingRole) {
      updateRole(editingRole.id, data);
    } else {
      addRole(data);
    }
    setIsFormOpen(false);
    setEditingRole(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this role? This cannot be undone.')) {
      deleteRole(id);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return roles;
    const q = searchQuery.toLowerCase();
    return roles.filter(
      (r) =>
        r.label?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.skills?.toLowerCase().includes(q)
    );
  }, [roles, searchQuery]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const pageData = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const totalSkills = roles.reduce((acc, r) => {
    return acc + (r.skills ? r.skills.split(',').filter(Boolean).length : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-sm">
              <Settings2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Role Management</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Define hiring roles and their target skill requirements.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setEditingRole(null); setIsFormOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-semibold hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition"
        >
          <PlusCircle size={16} />
          Create Role
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, color: 'brand' },
          { label: 'Total Skills Defined', value: totalSkills, color: 'emerald' },
          { label: 'Roles with JD', value: roles.filter((r) => r.jobDescription).length, color: 'violet' },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className={`text-3xl font-bold mt-1 text-${color}-600 dark:text-${color}-400`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role name, description, or skills..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-sm text-slate-400 whitespace-nowrap">
          {filtered.length} of {roles.length} roles
        </span>
      </div>

      {/* Table */}
      <RoleTable
        roles={pageData}
        onEdit={(r) => { setEditingRole(r); setIsFormOpen(true); }}
        onView={(r) => { setViewingRole(r); setIsViewOpen(true); }}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {filtered.length > PER_PAGE && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-900 dark:text-white">{filtered.length}</span> roles
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingRole(null); }}
        onSave={handleSave}
        editingRole={editingRole}
      />
      <RoleViewModal
        isOpen={isViewOpen}
        onClose={() => { setIsViewOpen(false); setViewingRole(null); }}
        role={viewingRole}
      />
    </div>
  );
}
