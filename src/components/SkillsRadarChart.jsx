import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend } from 'recharts';
import { CATEGORIES } from '../utils/skillsDatabase.js';

/**
 * Radar chart comparing the candidate's skill profile to the JD's "ideal" profile.
 *
 * Props:
 *   - resume: { [category]: number 0..100 }
 *   - jd:     { [category]: number 0..100 } (optional — when omitted only the resume is plotted)
 */
export default function SkillsRadarChart({ resume = {}, jd = null, height = 320 }) {
  const data = CATEGORIES.map((cat) => ({
    category: cat,
    Resume: resume[cat] ?? 0,
    'JD Ideal': jd ? jd[cat] ?? 0 : 0,
  }));

  return (
    <div className="card p-6">
      <h3 className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold mb-4">
        Skill Graph
      </h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="currentColor" className="text-slate-300 dark:text-slate-700" />
            <PolarAngleAxis dataKey="category" tick={{ fill: 'currentColor', fontSize: 12 }} className="text-slate-600 dark:text-slate-300" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip contentStyle={{ background: 'rgba(15,23,42,0.9)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            {jd && (
              <Radar name="JD Ideal" dataKey="JD Ideal" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
            )}
            <Radar name="Resume" dataKey="Resume" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.35} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
