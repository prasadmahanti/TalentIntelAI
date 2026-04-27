import React, { useState, useEffect } from 'react';
import { X, Save, UploadCloud, Eye, EyeOff, RefreshCw, UserPlus, Briefcase } from 'lucide-react';
import { useRoleStore } from '../../store/useRoleStore.js';

// Auto-generate a strong alphabetical+numeric password
function generatePassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

const emptyForm = {
  fullName: '', email: '', phone: '', gender: 'Male', dob: '',
  qualification: '', experience: '', hrExperience: '', currentCompany: '',
  expectedSalary: '', noticePeriod: '', joiningDate: '', address: '',
  city: '', state: '', country: '', pincode: '', skills: '',
  status: 'Pending', remarks: '', resumeName: '',
  username: '', password: '', userType: 'user', targetRole: '',
};

export default function CandidateFormModal({ isOpen, onClose, onSave, editingCandidate }) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const roles = useRoleStore((s) => s.roles);

  useEffect(() => {
    if (isOpen) {
      if (editingCandidate) {
        setFormData({ ...emptyForm, ...editingCandidate });
      } else {
        setFormData({ ...emptyForm, password: generatePassword() });
      }
      setErrors({});
      setShowPassword(false);
    }
  }, [isOpen, editingCandidate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-fill username from email
    if (name === 'email') {
      setFormData((prev) => ({ ...prev, email: value, username: value.split('@')[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const regeneratePassword = () => {
    setFormData((prev) => ({ ...prev, password: generatePassword() }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resumeName: 'File size must be less than 5MB' }));
        return;
      }
      setFormData((prev) => ({ ...prev, resumeName: file.name }));
      if (errors.resumeName) setErrors((prev) => ({ ...prev, resumeName: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())   newErrors.fullName  = 'Required';
    if (!formData.email.trim()) {
      newErrors.email = 'Required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Required';
    } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.qualification.trim()) newErrors.qualification = 'Required';
    if (!formData.username.trim())      newErrors.username  = 'Required';
    if (!formData.password.trim())      newErrors.password  = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSave(formData);
  };

  const renderInput = (label, name, type = 'text', options = null, colSpan = 1) => {
    const hasError = !!errors[name];
    const required = ['fullName', 'email', 'phone', 'qualification', 'username', 'password'].includes(name);
    return (
      <div className={`col-span-1 md:col-span-${colSpan} flex flex-col gap-1`}>
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {options ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`px-3 py-2 bg-white dark:bg-slate-950 border ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`}
          >
            {options.map((opt) => (
              <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={formData[name]}
            onChange={handleChange}
            rows={2}
            className={`px-3 py-2 bg-white dark:bg-slate-950 border ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`px-3 py-2 bg-white dark:bg-slate-950 border ${hasError ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`}
          />
        )}
        {hasError && <span className="text-xs text-red-500">{errors[name]}</span>}
      </div>
    );
  };

  const selectedRole = roles.find(r => r.id === formData.targetRole);
  const accentBase = selectedRole?.color || 'brand';

  // Map role color strings to Tailwind gradient classes
  const gradientClasses = {
    brand: 'from-brand-600 via-brand-500 to-brand-400',
    emerald: 'from-emerald-600 via-emerald-500 to-emerald-400',
    violet: 'from-violet-600 via-violet-500 to-violet-400',
    amber: 'from-amber-600 via-amber-500 to-amber-400',
    rose: 'from-rose-600 via-rose-500 to-rose-400',
    sky: 'from-sky-600 via-sky-500 to-sky-400',
    orange: 'from-orange-600 via-orange-500 to-orange-400',
  };

  const currentGradient = gradientClasses[accentBase] || gradientClasses.brand;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">

        {/* ── Dynamic Gradient Header ── */}
        <div className={`relative px-6 py-5 rounded-t-2xl bg-gradient-to-r ${currentGradient} overflow-hidden transition-all duration-500`}>
          {/* decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-28 h-28 bg-white/10 rounded-full" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <UserPlus size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  {editingCandidate ? 'Edit HR Candidate' : 'Register New HR Candidate'}
                </h2>
                <p className="text-sm text-white/75 mt-0.5">
                  {editingCandidate
                    ? 'Update profile, credentials, and role details below.'
                    : 'Fill in credentials, personal info, and professional background.'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Step pills */}
          <div className="relative flex items-center gap-3 mt-4">
            {['Credentials', 'Personal', 'Professional', 'Address', 'Onboarding'].map((step, i) => (
              <span
                key={step}
                className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30"
              >
                {i + 1}. {step}
              </span>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="candidate-form" onSubmit={handleSubmit} className="space-y-8">

            {/* ─── Login & Role Access ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Briefcase size={14} /> Login & Role Access
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                {/* Target Role Selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Role</label>
                  <select
                    name="targetRole"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                  >
                    <option value="">Select Role...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Username <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-slate-400 ml-1">(auto from email)</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="username"
                    className={`px-3 py-2 bg-white dark:bg-slate-950 border ${errors.username ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`}
                  />
                  {errors.username && <span className="text-xs text-red-500">{errors.username}</span>}
                </div>

                {/* Password with show/hide + regenerate */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Password <span className="text-red-500">*</span></span>
                    <button
                      type="button"
                      onClick={regeneratePassword}
                      className="text-xs text-brand-600 hover:text-brand-800 dark:text-brand-400 flex items-center gap-1 font-medium"
                      title="Regenerate password"
                    >
                      <RefreshCw size={11} />
                      Regenerate
                    </button>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-3 pr-10 py-2 font-mono bg-white dark:bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
                </div>

                {/* User Type */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">User Type</label>
                  <div className="flex gap-3 mt-1">
                    {[
                      { value: 'user', label: 'User', color: 'brand' },
                      { value: 'admin', label: 'Admin', color: 'rose' },
                    ].map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, userType: value }))}
                        className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                          formData.userType === value
                            ? color === 'brand'
                              ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                              : 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ─── Personal Information ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {renderInput('Full Name', 'fullName')}
                {renderInput('Email Address', 'email', 'email')}
                {renderInput('Phone Number', 'phone', 'tel')}
                {renderInput('Gender', 'gender', null, ['Male', 'Female', 'Other'])}
                {renderInput('Date of Birth', 'dob', 'date')}
              </div>
            </section>

            {/* ─── Professional Details ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Professional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {renderInput('Qualification', 'qualification')}
                {renderInput('Total Exp (Years)', 'experience', 'number')}
                {renderInput('HR Exp (Years)', 'hrExperience', 'number')}
                {renderInput('Current Company', 'currentCompany')}
                {renderInput('Expected Salary (LPA)', 'expectedSalary', 'number')}
                {renderInput('Notice Period (Days)', 'noticePeriod', 'number')}
                {renderInput('Skills (Comma separated)', 'skills', 'text', null, 3)}
              </div>
            </section>

            {/* ─── Address ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Address &amp; Context
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {renderInput('Address', 'address', 'textarea', null, 3)}
                {renderInput('City', 'city')}
                {renderInput('State', 'state')}
                {renderInput('Country', 'country')}
                {renderInput('Pincode', 'pincode')}
              </div>
            </section>

            {/* ─── Onboarding ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Onboarding &amp; Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {renderInput('Joining Date', 'joiningDate', 'date')}
                {renderInput('Status', 'status', null, ['Pending', 'Selected', 'Rejected'])}
                {renderInput('Remarks', 'remarks', 'textarea', null, 3)}
              </div>
            </section>

            {/* ─── Attachments ─── */}
            <section>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-brand-600 dark:text-brand-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                Attachments
              </h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition text-sm">
                  <UploadCloud size={18} />
                  Upload Resume
                  <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                </label>
                {formData.resumeName && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{formData.resumeName}</span>
                )}
                {errors.resumeName && <span className="text-xs text-red-500">{errors.resumeName}</span>}
              </div>
            </section>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button
            type="button"
            onClick={() => setFormData({ ...emptyForm, password: generatePassword() })}
            className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="candidate-form"
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm transition"
          >
            <Save size={16} />
            {editingCandidate ? 'Update Record' : 'Save Candidate'}
          </button>
        </div>
      </div>
    </div>
  );
}
