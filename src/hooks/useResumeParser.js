import { useCallback, useState } from 'react';
import { extractText } from '../services/index.js';
import { parseResume } from '../utils/parseResume.js';
import { scoreResume } from '../utils/scoreResume.js';
import { matchJobDescription } from '../utils/matchJobDescription.js';
import { useResumeStore } from '../store/useResumeStore.js';

/**
 * Upload -> extract -> parse -> score -> (optional) match pipeline.
 *
 * If the caller passes `roleId` and `jobDescription`, the resume is associated with that role
 * and the JD match is computed at upload time and stored on the record so the dashboard's
 * "Candidates Matched" stat is cheap to compute.
 *
 * Returns:
 *   parse(file, { roleId, jobDescription }) -> Promise<ResumeRecord>
 *   status, progress, error
 */
export function useResumeParser() {
  const addResume = useResumeStore((s) => s.addResume);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const parse = useCallback(
    async (file, opts = {}) => {
      try {
        setError(null);
        setStatus('reading');
        setProgress(0.1);

        const rawText = await extractText(file);
        setProgress(0.4);

        setStatus('parsing');
        const profile = parseResume(rawText, { fileName: file.name });
        setProgress(0.65);

        setStatus('scoring');
        const score = scoreResume(profile);
        setProgress(0.85);

        let matchPercentage = null;
        if (opts.jobDescription) {
          const m = matchJobDescription(profile, opts.jobDescription);
          matchPercentage = m.percentage;
        }

        const record = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
          rawText,
          profile,
          score,
          roleId: opts.roleId || null,
          jobDescription: opts.jobDescription || '',
          matchPercentage,
        };

        addResume(record);
        setStatus('done');
        setProgress(1);
        return record;
      } catch (err) {
        console.error('Resume parsing failed:', err);
        setError(err.message || 'Failed to parse resume.');
        setStatus('error');
        throw err;
      }
    },
    [addResume]
  );

  return { parse, status, progress, error };
}
