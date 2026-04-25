/**
 * Job-description matcher.
 *
 * Approach (no backend, no embeddings API):
 *   1. Run the JD through the same alias index → produce a list of *required* canonical skills.
 *   2. For each required skill, check whether the resume has it directly OR a `related` skill
 *      (semantic-ish match — see skillsDatabase.isRelated). Hits are weighted by recency.
 *   3. Compute a 0..100 match percentage = weighted matched / weighted required.
 *   4. Produce a "Why Not" gap list of missing skills and a per-category breakdown for the radar
 *      chart, both for the resume and the JD's "ideal" profile.
 */

import { getAliasIndex, isRelated, SKILL_DATABASE, CATEGORIES } from './skillsDatabase.js';

export function matchJobDescription(profile, jdText) {
  const jd = (jdText || '').trim();
  if (!jd) {
    return {
      percentage: 0,
      requiredSkills: [],
      matched: [],
      missing: [],
      partial: [],
      jdByCategory: zeroCategories(),
      resumeByCategory: bucketResume(profile.skills),
      whyNot: 'Paste a job description to compute a match.',
      seniorityMatch: null,
    };
  }

  const requiredSkills = extractRequiredSkills(jd);
  const jdSeniority = detectSeniority(jd);
  const candidateSeniority = inferSeniority(profile);

  const resumeSet = new Set(profile.skills.map((s) => s.name));
  const recencyOf = (name) => profile.skills.find((s) => s.name === name)?.recency ?? 0;

  const matched = [];
  const partial = [];
  const missing = [];

  let weightedReq = 0;
  let weightedMatched = 0;

  for (const req of requiredSkills) {
    weightedReq += 1;
    if (resumeSet.has(req)) {
      const recency = recencyOf(req);
      weightedMatched += recency;
      matched.push({ skill: req, type: 'direct', recency });
    } else {
      // Check semantic match via related list.
      const semantic = [...resumeSet].find((s) => isRelated(s, req));
      if (semantic) {
        const recency = recencyOf(semantic);
        weightedMatched += recency * 0.7; // partial credit
        partial.push({ skill: req, via: semantic, recency });
      } else {
        missing.push(req);
      }
    }
  }

  // Seniority adjustment: if JD asks for "senior" but candidate has < 4 years, knock off 10 points.
  let seniorityPenalty = 0;
  if (jdSeniority === 'senior' && candidateSeniority === 'junior') seniorityPenalty = 10;
  if (jdSeniority === 'junior' && candidateSeniority === 'senior') seniorityPenalty = 5;

  let percentage = weightedReq === 0 ? 0 : Math.round((weightedMatched / weightedReq) * 100);
  percentage = Math.max(0, Math.min(100, percentage - seniorityPenalty));

  return {
    percentage,
    requiredSkills,
    matched,
    partial,
    missing,
    jdByCategory: bucketSkillNames(requiredSkills),
    resumeByCategory: bucketResume(profile.skills),
    whyNot: buildWhyNot(matched, missing, partial, jdSeniority, candidateSeniority),
    seniorityMatch: { jd: jdSeniority, candidate: candidateSeniority, penalty: seniorityPenalty },
  };
}

// ---------- helpers ----------

export function extractRequiredSkills(jd) {
  const aliasIdx = getAliasIndex();
  const lower = jd.toLowerCase();
  const found = new Set();
  for (const [alias, canonical] of aliasIdx.entries()) {
    const safe = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re =
      alias.length <= 3
        ? new RegExp(`\\b${safe}\\b`, 'i')
        : new RegExp(`(^|[^a-z0-9])${safe}([^a-z0-9]|$)`, 'i');
    if (re.test(lower)) found.add(canonical);
  }
  return [...found];
}

export function detectSeniority(text) {
  const t = text.toLowerCase();
  if (/\b(senior|sr\.?|principal|staff|lead)\b/.test(t)) return 'senior';
  if (/\b(junior|jr\.?|entry[- ]level|graduate|intern)\b/.test(t)) return 'junior';
  if (/\b(mid[- ]level|intermediate)\b/.test(t)) return 'mid';
  return 'unspecified';
}

function inferSeniority(profile) {
  const y = profile.yearsExperience;
  if (y >= 6) return 'senior';
  if (y >= 3) return 'mid';
  if (y > 0) return 'junior';
  return 'unspecified';
}

function bucketSkillNames(skillNames) {
  const buckets = zeroCategories();
  for (const name of skillNames) {
    const cat = SKILL_DATABASE[name]?.category;
    if (cat && cat in buckets) buckets[cat] += 1;
  }
  // Normalise to 0..100 with a soft cap so a JD with 5 cloud skills doesn't peg the axis.
  for (const c of CATEGORIES) buckets[c] = Math.min(100, Math.round((buckets[c] / 4) * 100));
  return buckets;
}

function bucketResume(skills) {
  const buckets = zeroCategories();
  for (const s of skills) {
    const cat = SKILL_DATABASE[s.name]?.category;
    if (cat && cat in buckets) buckets[cat] += s.recency ?? 0.5;
  }
  for (const c of CATEGORIES) buckets[c] = Math.min(100, Math.round((buckets[c] / 4) * 100));
  return buckets;
}

function zeroCategories() {
  return Object.fromEntries(CATEGORIES.map((c) => [c, 0]));
}

function buildWhyNot(matched, missing, partial, jdSen, candSen) {
  const parts = [];
  if (missing.length === 0 && matched.length > 0) {
    parts.push(`Strong match — every required skill is on the resume.`);
  } else if (missing.length > 0) {
    parts.push(`Missing ${missing.length} required skill${missing.length > 1 ? 's' : ''}: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}.`);
  }
  if (partial.length > 0) {
    parts.push(
      `Partial credit for ${partial.length} skill${partial.length > 1 ? 's' : ''} via related experience (e.g. ${partial[0].skill} ← ${partial[0].via}).`
    );
  }
  if (jdSen === 'senior' && candSen === 'junior') {
    parts.push(`Seniority gap — JD asks for a senior profile but the candidate reads as junior.`);
  }
  return parts.join(' ');
}
