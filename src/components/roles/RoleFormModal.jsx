import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const COLORS = ['brand', 'emerald', 'violet', 'amber', 'rose', 'sky', 'orange'];

const emptyForm = {
  label: '',
  description: '',
  color: 'brand',
  skills: '',
  jobDescription: '',
};

export default function RoleFormModal({ isOpen, onClose, onSave, editingRole }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData(editingRole ? { ...emptyForm, ...editingRole } : emptyForm);
      setErrors({});
    }
  }, [isOpen, editingRole]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.label.trim()) errs.label = 'Role name is required';
    if (!formData.skills.trim()) errs.skills = 'At least one skill is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const labelErr = !!errors.label;
  const skillsErr = !!errors.skills;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingRole ? 'Edit Role' : 'Create New Role'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form id="role-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

          {/* Name + Color Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                name="label"
                value={formData.label}
                onChange={handleChange}
                placeholder="e.g. Senior DevOps Engineer"
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${labelErr ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
              />
              {labelErr && <p className="text-xs text-red-500 mt-1">{errors.label}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Theme Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, color: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${formData.color === c ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: colorHex(c) }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary of the role..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Skills <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-2">(comma-separated)</span>
            </label>
            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. Docker, Kubernetes, Terraform, CI/CD, Linux"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${skillsErr ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'}`}
            />
            {skillsErr && <p className="text-xs text-red-500 mt-1">{errors.skills}</p>}
            {formData.skills && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.skills.split(',').map((s) => s.trim()).filter(Boolean).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs rounded-full border border-brand-200 dark:border-brand-800">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Job Description</label>
            <textarea
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              rows={8}
              placeholder="Paste or write the default JD for this role..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button type="button" onClick={() => setFormData(emptyForm)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white transition">
            Reset
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            Cancel
          </button>
          <button type="submit" form="role-form" className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition">
            <Save size={15} />
            {editingRole ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
}

function colorHex(c) {
  const map = { brand: '#6366f1', emerald: '#10b981', violet: '#7c3aed', amber: '#f59e0b', rose: '#f43f5e', sky: '#0ea5e9', orange: '#f97316' };
  return map[c] || '#6366f1';
}
