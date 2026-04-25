import { Sparkles, FileEdit, Plus, Mic, Lightbulb } from 'lucide-react';

/**
 * Renders a structured suggestions object — works for both rule-based output and OpenAI output.
 *
 * Expected shape:
 * { summary_rewrite, bullet_improvements[], skills_to_add[], tone_fixes[], extras[] }
 */
export default function SuggestionsPanel({ suggestions, source = 'rule-based' }) {
  if (!suggestions) return null;
  const sections = [
    {
      key: 'summary_rewrite',
      title: 'Summary Rewrite',
      icon: <FileEdit size={16} />,
      content: suggestions.summary_rewrite ? [suggestions.summary_rewrite] : [],
    },
    {
      key: 'bullet_improvements',
      title: 'Bullet Improvements',
      icon: <Sparkles size={16} />,
      content: suggestions.bullet_improvements || [],
    },
    {
      key: 'skills_to_add',
      title: 'Skills to Add',
      icon: <Plus size={16} />,
      content: suggestions.skills_to_add || [],
    },
    {
      key: 'tone_fixes',
      title: 'Tone & Bias Fixes',
      icon: <Mic size={16} />,
      content: suggestions.tone_fixes || [],
    },
    {
      key: 'extras',
      title: 'Other Tips',
      icon: <Lightbulb size={16} />,
      content: suggestions.extras || [],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
          AI Suggestions
        </h3>
        <span className={source === 'openai' ? 'badge-success' : 'badge-neutral'}>
          {source === 'openai' ? 'GPT-powered' : 'Rule-based'}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sections.map((s) =>
          s.content.length === 0 ? null : (
            <div key={s.key} className="card p-5">
              <h4 className="font-semibold flex items-center gap-2 text-sm mb-3">
                {s.icon} {s.title}
              </h4>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
                {s.content.map((item, i) => (
                  <li key={i} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
      </div>
    </div>
  );
}
