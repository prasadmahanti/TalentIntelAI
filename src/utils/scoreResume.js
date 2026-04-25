/**
 * Resume scoring engine — computes the headline 0-100 ATS-style score.
 *
 * The PRD weights are:
 *   Hard Skills   50%   - count + variety + recency-weighted
 *   Experience    30%   - years of experience + clarity of dates
 *   Education     10%   - has at least one recognised degree / cert
 *   Soft Skills   10%   - presence in summary / experience prose
 *
 * On top of those four, we expose four sub-scores that are useful in the UI even though they
 * roll up into the four PRD buckets:
 *   - formatting     0..100  (readable structure, sane length, sections present)
 *   - keywords       0..100  (raw skill density)
 *   - experience     0..100  (years + dates clarity)
 *   - skillsRelevance 0..100 (recency-weighted skill score)
 */

import { CATEGORIES, SKILL_DATABASE } from './skillsDatabase.js';

export function scoreResume(profile) {
  const formatting = scoreFormatting(profile);
  const keywords = scoreKeywords(profile);
  const experience = scoreExperience(profile);
  const skillsRelevance = scoreSkillsRelevance(profile);
  const education = scoreEducation(profile);
  const softSkills = scoreSoftSkills(profile);

  // PRD weighted total
  const total = Math.round(
    skillsRelevance * 0.5 + experience * 0.3 + education * 0.1 + softSkills * 0.1
  );

  // Per-category scores for the radar chart (skill count per category, normalised)
  const byCategory = bucketByCategory(profile.skills);

  return {
    total: clamp(total, 0, 100),
    breakdown: {
      hardSkills: skillsRelevance, // 50%
      experience, // 30%
      education, // 10%
      softSkills, // 10%
    },
    subscores: {
      formatting,
      keywords,
      experience,
      skillsRelevance,
    },
    byCategory,
  };
}

// ---------- individual scorers ----------

function scoreFormatting(profile) {
  let s = 50;
  // Has the major sections?
  if (profile.summary) s += 10;
  if (profile.experiences.length > 0) s += 15;
  if (profile.education.length > 0) s += 10;
  if (profile.skills.length > 0) s += 10;
  // Word count sanity: too short or too long is penalised.
  if (profile.wordCount >= 250 && profile.wordCount <= 1200) s += 5;
  else if (profile.wordCount > 1800) s -= 5;
  // Has contact info?
  if (profile.email) s += 2;
  if (profile.phone) s += 2;
  return clamp(s, 0, 100);
}

function scoreKeywords(profile) {
  // Density of recognised skills relative to a "good" target of ~20.
  const recognised = profile.skills.filter((s) => SKILL_DATABASE[s.name]).length;
  const ratio = Math.min(recognised / 20, 1.5);
  return Math.round(clamp(ratio * 70 + 20, 0, 100));
}

function scoreExperience(profile) {
  const years = profile.yearsExperience;
  // 0y → ~30, 2y → 55, 5y → 75, 10y → 95, capped at 100.
  const base = clamp(30 + years * 7, 0, 100);
  // Clarity: at least 2 experience entries with detected date ranges = full clarity bonus.
  const clarityBonus = profile.experiences.length >= 2 ? 0 : -10;
  return Math.round(clamp(base + clarityBonus, 0, 100));
}

function scoreSkillsRelevance(profile) {
  // Sum of recency weights, normalised to a target of ~12 fully-weighted skills.
  const sumRecency = profile.skills.reduce((acc, s) => acc + (s.recency ?? 0.5), 0);
  const ratio = Math.min(sumRecency / 12, 1.5);
  return Math.round(clamp(ratio * 70 + 20, 0, 100));
}

function scoreEducation(profile) {
  let s = 40;
  if (profile.education.length > 0) s += 35;
  if (profile.certifications.length > 0) s += 25;
  return clamp(s, 0, 100);
}

function scoreSoftSkills(profile) {
  // 0 soft skills → 30, 5+ → 100
  const n = profile.softSkills.length;
  return Math.round(clamp(30 + n * 14, 0, 100));
}

// ---------- helpers ----------

function bucketByCategory(skills) {
  const buckets = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
  for (const s of skills) {
    const info = SKILL_DATABASE[s.name];
    const cat = info?.category;
    if (cat && cat in buckets) buckets[cat] += s.recency ?? 0.5;
  }
  // Normalise each bucket: 0..5 raw → 0..100 score
  const out = {};
  for (const c of CATEGORIES) {
    out[c] = Math.round(clamp((buckets[c] / 5) * 100, 0, 100));
  }
  return out;
}

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}
