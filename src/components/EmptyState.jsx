import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

export default function EmptyState({
  title = 'No resume yet',
  message = 'Upload a resume to get started.',
  ctaTo = '/upload',
  ctaLabel = 'Upload a resume',
}) {
  return (
    <div className="card p-10 flex flex-col items-center justify-center text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
        <FileQuestion size={26} />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5">{message}</p>
      {ctaTo && (
        <Link to={ctaTo} className="btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
