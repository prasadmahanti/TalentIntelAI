import React, { useState, useMemo } from 'react';
import { UserPlus, Search, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCandidateStore } from '../store/useCandidateStore';
import CandidateTable from '../components/candidates/CandidateTable';
import CandidateFormModal from '../components/candidates/CandidateFormModal';
import CandidateViewModal from '../components/candidates/CandidateViewModal';

export default function CandidatesPage() {
  const { candidates, addCandidate, updateCandidate, deleteCandidate } = useCandidateStore();

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Sort States
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Handlers
  const handleSave = (data) => {
    if (editingCandidate) {
      updateCandidate(editingCandidate.id, data);
    } else {
      addCandidate(data);
    }
    setIsFormOpen(false);
    setEditingCandidate(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      deleteCandidate(id);
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // CSV Export (Bonus Feature)
  const exportToCSV = () => {
    if (candidates.length === 0) return;
    const headers = Object.keys(candidates[0]).filter(k => k !== 'id');
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + candidates.map(row => {
          return headers.map(fieldName => `"${row[fieldName] || ''}"`).join(",");
      }).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hr_candidates.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Compute Processed Data
  const processedCandidates = useMemo(() => {
    let filtered = [...candidates];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.fullName?.toLowerCase().includes(q) || 
        c.email?.toLowerCase().includes(q) || 
        c.phone?.includes(q)
      );
    }

    // Filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Sort
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [candidates, searchQuery, statusFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(processedCandidates.length / recordsPerPage) || 1;
  const currentData = processedCandidates.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">HR Candidates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage registrations, statuses, and profiles for potential hires.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button 
            onClick={() => { setEditingCandidate(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition"
          >
            <UserPlus size={16} />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="flex-1 sm:w-40 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <CandidateTable 
        candidates={currentData} 
        onEdit={(c) => { setEditingCandidate(c); setIsFormOpen(true); }}
        onView={(c) => { setViewingCandidate(c); setIsViewOpen(true); }}
        onDelete={handleDelete}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />

      {/* Pagination */}
      {processedCandidates.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold text-slate-900 dark:text-white">{(currentPage - 1) * recordsPerPage + 1}</span> to <span className="font-semibold text-slate-900 dark:text-white">{Math.min(currentPage * recordsPerPage, processedCandidates.length)}</span> of <span className="font-semibold text-slate-900 dark:text-white">{processedCandidates.length}</span> candidates
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-2 flex items-center">
               Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-md text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CandidateFormModal 
        isOpen={isFormOpen} 
        onClose={() => { setIsFormOpen(false); setEditingCandidate(null); }} 
        onSave={handleSave}
        editingCandidate={editingCandidate}
      />

      <CandidateViewModal 
        isOpen={isViewOpen} 
        onClose={() => { setIsViewOpen(false); setViewingCandidate(null); }} 
        candidate={viewingCandidate}
      />
    </div>
  );
}
