import { useResumeStore } from '../store/useResumeStore.js';
import { Check, UserPlus } from 'lucide-react';

/**
 * Pill button - flips a resume's "hired" flag in the global store.
 */
export default function HireToggle({ id, size = 'md' }) {
  const hired = useResumeStore((s) => s.hiredIds.includes(id));
  const setHired = useResumeStore((s) => s.setHired);
  const compact = size === 'sm';

  return (
    <button
      type="button"
      onClick={() => setHired(id, !hired)}
      className={`btn ${hired ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'btn-secondary'} ${compact ? 'text-xs px-2 py-1' : ''}`}
      title={hired ? 'Marked as hired - click to undo' : 'Mark this candidate as hired'}
    >
      {hired ? <Check size={compact ? 12 : 16} /> : <UserPlus size={compact ? 12 : 16} />}
      {hired ? 'Hired' : 'Mark hired'}
    </button>
  );
}
