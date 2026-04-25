/**
 * Rule-based suggestions engine — runs offline, always available.
 *
 * It consumes a parsed ResumeProfile (plus an optional matchResult) and produces a structured
 * list of suggestions in roughly the same shape as the OpenAI service so the UI can render
 * either source uniformly.
 */

export function generateSuggestions(profile, matchResult) {
  const suggestions = {
    summary_rewrite: '',
    bullet_improvements: [],
    skills_to_add: [],
    tone_fixes: [],
    extras: [], // misc tips that don't fit the four buckets
  };

  // ---- Summary rewrite ----
  if (!profile.summary || profile.summary.length < 80) {
    const yrs = profile.yearsExperience > 0 ? `${profile.yearsExperience}+ years of` : '';
    const topSkills = profile.skills
      .slice()
      .sort((a, b) => (b.recency ?? 0) - (a.recency ?? 0))
      .slice(0, 4)
      .map((s) => s.name)
      .join(', ');
    suggestions.summary_rewrite =
      `Add a 2-3 sentence summary near the top of your resume. Example: "Software engineer with ${yrs} hands-on experience in ${topSkills || 'modern web technologies'}. Proven track record of shipping production systems and collaborating cross-functionally. Looking to apply these skills to <target role>."`;
  } else if (profile.summary.length > 600) {
    suggestions.summary_rewrite = 'Your summary is quite long — trim it to 2-3 punchy sentences. Recruiters usually skim the top of the resume in under 10 seconds.';
  }

  // ---- Bullet improvements ----
  // Look at experience blocks and flag bullets that don't start with a strong verb or lack a metric.
  const STRONG_VERBS = ['led', 'built', 'shipped', 'designed', 'architected', 'reduced', 'increased', 'launched', 'migrated', 'automated', 'scaled', 'optimized', 'mentored'];
  for (const exp of profile.experiences.slice(0, 3)) {
    const bullets = exp.raw.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('•') || l.startsWith('-') || l.startsWith('*'));
    for (const b of bullets.slice(0, 2)) {
      const noBullet = b.replace(/^[•\-*]\s*/, '');
      const firstWord = (noBullet.split(/\s+/)[0] || '').toLowerCase();
      const hasNumber = /\d/.test(noBullet);
      if (!STRONG_VERBS.includes(firstWord)) {
        suggestions.bullet_improvements.push(
          `Lead this bullet with a strong action verb (e.g. "Built", "Led", "Reduced…"): "${truncate(noBullet, 80)}"`
        );
      } else if (!hasNumber) {
        suggestions.bullet_improvements.push(
          `Add a quantified result to: "${truncate(noBullet, 80)}" — e.g. "by 30%", "to 50K users".`
        );
      }
      if (suggestions.bullet_improvements.length >= 5) break;
    }
    if (suggestions.bullet_improvements.length >= 5) break;
  }

  // ---- Skills to add (from match result) ----
  if (matchResult?.missing?.length) {
    suggestions.skills_to_add = matchResult.missing.slice(0, 8);
  } else if (profile.skills.length < 8) {
    suggestions.skills_to_add = ['Add a dedicated "Technical Skills" section listing your top 10-15 tools and frameworks.'];
  }

  // ---- Tone fixes ----
  if ((profile.codedHits || []).length > 0) {
    suggestions.tone_fixes.push(
      `Avoid coded language: "${profile.codedHits.join('", "')}" — these can read as biased or unprofessional. Replace with neutral terms like "expert", "high-performing", or specific accomplishments.`
    );
  }
  if (!profile.softSkills.length) {
    suggestions.tone_fixes.push(
      'Mention 2-3 soft skills (communication, mentoring, cross-functional collaboration) in your summary or experience bullets.'
    );
  }

  // ---- Extras ----
  if (!profile.email) suggestions.extras.push('Add an email address to your contact section.');
  if (!profile.phone) suggestions.extras.push('Add a phone number to your contact section.');
  if (profile.education.length === 0) suggestions.extras.push('Include an Education section with your degree and graduation year.');
  if (profile.certifications.length === 0) {
    suggestions.extras.push('Adding 1-2 industry certifications (AWS, Azure, Scrum, etc.) would strengthen your profile.');
  }

  // Stale-skill flag: skills with recency < 0.5 (last touched 5+ years ago)
  const stale = profile.skills.filter((s) => (s.recency ?? 0) < 0.5).map((s) => s.name);
  if (stale.length) {
    suggestions.extras.push(
      `Stale skills detected (last used 5+ years ago): ${stale.slice(0, 5).join(', ')}. Consider removing them or adding a recent project to refresh.`
    );
  }

  return suggestions;
}

function truncate(s, n) {
  return s.length <= n ? s : s.slice(0, n - 1) + '…';
}
