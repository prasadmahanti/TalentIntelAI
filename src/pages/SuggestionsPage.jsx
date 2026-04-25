import { useMemo, useState } from 'react';
import { useResumeStore } from '../store/useResumeStore.js';
import { generateSuggestions } from '../utils/generateSuggestions.js';
import { matchJobDescription } from '../utils/matchJobDescription.js';
import { generateAiSuggestions } from '../services/aiService.js';
import SuggestionsPanel from '../components/SuggestionsPanel.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { Sparkles, KeyRound, Loader2 } from 'lucide-react';

export default function SuggestionsPage() {
  const active = useResumeStore((s) => s.getActiveResume());
  const jd = useResumeStore((s) => s.jobDescription);
  const settings = useResumeStore((s) => s.settings);
  const updateSettings = useResumeStore((s) => s.updateSettings);

  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const ruleBased = useMemo(() => {
    if (!active) return null;
    const matchResult = jd ? matchJobDescription(active.profile, jd) : null;
    return generateSuggestions(active.profile, matchResult);
  }, [active, jd]);

  const runOpenAi = async () => {
    if (!active) return;
    setLoading(true);
    setAiError(null);
    try {
      const result = await generateAiSuggestions({
        profile: active.profile,
        jobDescription: jd,
        key: settings.openAiKey,
        model: settings.openAiModel,
      });
      setAiResult(result);
    } catch (e) {
      setAiError(e.message || 'AI request failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!active) return <EmptyState title="Upload a resume to get suggestions" />;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Suggestions</h1>

      <div className="card p-5">
        <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-3 flex items-center gap-2">
          <KeyRound size={14} /> OpenAI API Key (optional)
        </h3>
        <div className="grid sm:grid-cols-[1fr,auto,auto] gap-2">
          <input
            type="password"
            placeholder="sk-…  (stored only in localStorage on your machine)"
            className="input font-mono"
            value={settings.openAiKey}
            onChange={(e) => updateSettings({ openAiKey: e.target.value })}
          />
          <select
            className="input"
            value={settings.openAiModel}
            onChange={(e) => updateSettings({ openAiModel: e.target.value })}
          >
            <option value="gpt-4o-mini">gpt-4o-mini</option>
            <option value="gpt-4o">gpt-4o</option>
            <option value="gpt-4-turbo">gpt-4-turbo</option>
          </select>
          <button
            type="button"
            onClick={runOpenAi}
            disabled={!settings.openAiKey || loading}
            className="btn-primary"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Without a key, we still produce structured rule-based suggestions below. Your key is sent directly from your browser to <code>api.openai.com</code> — Anthropic never sees it.
        </p>
        {aiError && (
          <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">⚠ {aiError}</p>
        )}
      </div>

      {aiResult && (
        <div>
          <SuggestionsPanel suggestions={aiResult} source="openai" />
        </div>
      )}

      <div>
        <SuggestionsPanel suggestions={ruleBased} source="rule-based" />
      </div>
    </div>
  );
}
