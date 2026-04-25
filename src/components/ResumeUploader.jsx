import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { useResumeParser } from '../hooks/useResumeParser.js';
import ProgressBar from './ProgressBar.jsx';

const ACCEPT = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
};

/**
 * Drag-and-drop uploader.
 *
 * Props:
 *  - roleId          : optional role ID to attach to the parsed resume
 *  - jobDescription  : optional JD text to evaluate the resume against at upload time
 *  - disabled        : disables the drop target (e.g. when no role is selected yet)
 *  - autoNavigate    : whether to navigate to /analysis on success
 */
export default function ResumeUploader({
  roleId = null,
  jobDescription = '',
  disabled = false,
  autoNavigate = true,
}) {
  const { parse, status, progress, error } = useResumeParser();
  const navigate = useNavigate();

  const onDrop = useCallback(
    async (accepted) => {
      if (!accepted?.length) return;
      try {
        for (const file of accepted) {
          await parse(file, { roleId, jobDescription });
        }
        if (autoNavigate) navigate('/analysis');
      } catch {
        /* error state is shown below */
      }
    },
    [parse, navigate, roleId, jobDescription, autoNavigate]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    disabled,
  });

  const isWorking = status !== 'idle' && status !== 'error' && status !== 'done';

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`card p-10 border-2 border-dashed text-center transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800'
            : 'cursor-pointer hover:border-brand-400'
        } ${
          isDragActive ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-900/10' : 'border-slate-300 dark:border-slate-700'
        } ${isDragReject ? 'border-rose-500 bg-rose-50/40' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4">
          <UploadCloud size={26} />
        </div>
        <h3 className="text-lg font-semibold">
          {disabled ? 'Pick a role first' : 'Drop your resume here'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {disabled
            ? 'Selecting a role unlocks the upload and pre-fills the JD.'
            : 'or click to browse - PDF, DOCX, or TXT, up to 10 MB'}
        </p>
        <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
          <FileText size={12} /> Files are parsed locally - nothing leaves your browser.
        </p>
      </div>

      {isWorking && (
        <div className="card p-4">
          <ProgressBar value={progress * 100} label={`${capitalize(status)}...`} />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-sm">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block">Upload failed</strong>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
