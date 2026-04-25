/**
 * Resume parser - turns raw text into a structured ResumeProfile object.
 *
 * It runs locally (no LLM), so it relies on:
 *   - Regex-based NER for name/email/phone/location/dates.
 *   - Skills taxonomy lookups for hard skills.
 *   - Section heading detection for summary / experience / education / certifications.
 *   - Temporal recency: dates are extracted from each experience block; skills mentioned in
 *     a recent block get a higher recency weight than skills last touched 5+ years ago.
 */

import { SKILL_DATABASE, SOFT_SKILLS, getAliasIndex, CODED_LANGUAGE } from './skillsDatabase.js';

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/;

const SECTION_HEADERS = {
  summary: /^(summary|professional summary|profile|objective|about)\b/i,
  experience: /^(experience|work experience|professional experience|employment(\s+history)?)\b/i,
  education: /^(education|academic background|qualifications)\b/i,
  skills: /^(skills|technical skills|core competencies|technologies)\b/i,
  certifications: /^(certifications?|licenses?|courses?)\b/i,
  projects: /^(projects?|personal projects)\b/i,
};

/**
 * @param {string} rawText  text extracted from the file
 * @param {{fileName?: string}} opts
 * @returns ResumeProfile
 */
export function parseResume(rawText, opts = {}) {
  const text = (rawText || '').replace(/\r/g, '').trim();
  // Keep blank lines so paragraph splits survive in section bodies.
  const allLines = text.split('\n').map((l) => l.trim());
  const lines = allLines.filter(Boolean); // for header / contact heuristics

  const email = (text.match(EMAIL_RE) || [])[0] || '';
  const phoneMatch = text.match(PHONE_RE);
  const phone = phoneMatch ? phoneMatch[0].trim() : '';

  const name =
    guessName(lines.slice(0, 8), email, phone) || guessNameFromFile(opts.fileName);
  const location = guessLocation(lines.slice(0, 12));

  const sections = splitSections(allLines);

  const skills = extractSkills(text, sections.skills?.body || '');

  const experiences = extractExperiences(sections.experience?.body || text);
  const yearsExperience = computeTotalYears(experiences);

  const now = new Date();
  const skillRecency = computeSkillRecency(skills, experiences, text, now);

  const education = extractEducation(sections.education?.body || '');
  const certifications = extractCertifications(sections.certifications?.body || text);
  const softSkills = extractSoftSkills(text);
  const summary = (sections.summary?.body || '').slice(0, 800);

  const codedHits = CODED_LANGUAGE.filter((w) =>
    new RegExp(`\\b${w}\\b`, 'i').test(text)
  );

  return {
    fileName: opts.fileName || '',
    name,
    email,
    phone,
    location,
    summary,
    skills,
    skillRecency,
    softSkills,
    experiences,
    yearsExperience,
    education,
    certifications,
    codedHits,
    wordCount: lines.join(' ').split(/\s+/).length,
    rawTextSnippet: text.slice(0, 4000),
  };
}

function guessName(headLines, email, phone) {
  for (const line of headLines) {
    if (!line) continue;
    if (email && line.includes(email)) continue;
    if (phone && line.includes(phone)) continue;
    if (/@|\d{3}/.test(line)) continue;
    const words = line.split(/\s+/);
    if (words.length < 2 || words.length > 5) continue;
    const cappedRatio =
      words.filter((w) => /^[A-Z][a-zA-Z'-]+$/.test(w)).length / words.length;
    if (cappedRatio >= 0.6) return line;
  }
  return '';
}

function guessNameFromFile(fileName) {
  if (!fileName) return '';
  const base = fileName.replace(/\.[^.]+$/, '').replace(/[_\-]+/g, ' ');
  const words = base.split(/\s+/).filter((w) => /^[A-Za-z]+$/.test(w));
  if (words.length >= 2 && words.length <= 4) {
    return words
      .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }
  return '';
}

function guessLocation(headLines) {
  const re = /\b([A-Z][a-zA-Z.\s]+),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)\b/;
  for (const line of headLines) {
    const m = line.match(re);
    if (m) return m[0];
  }
  return '';
}

function splitSections(lines) {
  const sections = {};
  let current = null;
  let buffer = [];

  const flush = () => {
    if (current) sections[current] = { body: buffer.join('\n').trim() };
    buffer = [];
  };

  for (const line of lines) {
    let matched = null;
    for (const [key, re] of Object.entries(SECTION_HEADERS)) {
      if (line.length <= 40 && re.test(line)) {
        matched = key;
        break;
      }
    }
    if (matched) {
      flush();
      current = matched;
    } else if (current) {
      buffer.push(line);
    }
  }
  flush();
  return sections;
}

function extractSkills(fullText, skillsSectionText) {
  const aliasIdx = getAliasIndex();
  const found = new Map();
  const lower = fullText.toLowerCase();

  for (const [alias, canonical] of aliasIdx.entries()) {
    const safe = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re =
      alias.length <= 3
        ? new RegExp(`\\b${safe}\\b`, 'i')
        : new RegExp(`(^|[^a-z0-9])${safe}([^a-z0-9]|$)`, 'i');
    if (re.test(lower)) {
      if (!found.has(canonical)) {
        found.set(canonical, { name: canonical, source: 'taxonomy' });
      }
    }
  }

  if (skillsSectionText) {
    const candidates = skillsSectionText
      .split(/[\n,•·;|]/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 2 && s.length <= 30 && /[a-zA-Z]/.test(s));
    for (const c of candidates) {
      const canonical = aliasIdx.get(c.toLowerCase());
      if (canonical) {
        if (!found.has(canonical)) {
          found.set(canonical, { name: canonical, source: 'section' });
        }
      } else if (
        /^[A-Za-z][A-Za-z0-9+.#\-/ ]{1,28}$/.test(c) &&
        !/^[a-z\s]+$/i.test(c)
      ) {
        if (!found.has(c)) found.set(c, { name: c, source: 'section' });
      }
    }
  }

  return [...found.values()];
}

function extractExperiences(text) {
  if (!text) return [];

  const lineYearRe =
    /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(\d{4})\s*[-–to]+\s*((?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:\d{4}|present|current|now))/i;

  const lines = text.split('\n');
  const blockStarts = [];
  for (let i = 0; i < lines.length; i++) {
    if (lineYearRe.test(lines[i])) blockStarts.push(i);
  }

  const out = [];
  for (let i = 0; i < blockStarts.length; i++) {
    const dateLineIdx = blockStarts[i];
    const blockStart = Math.max(0, dateLineIdx - 1);
    const blockEnd =
      i + 1 < blockStarts.length ? blockStarts[i + 1] - 1 : lines.length;
    const block = lines.slice(blockStart, blockEnd).join('\n').trim();

    const m = block.match(lineYearRe);
    if (!m) continue;
    const startYear = parseInt(m[1], 10);
    const endRawWhole = m[2].toLowerCase();
    const endYearMatch = endRawWhole.match(/\d{4}/);
    const endYear =
      /present|current|now/.test(endRawWhole) || !endYearMatch
        ? new Date().getFullYear()
        : parseInt(endYearMatch[0], 10);
    if (!startYear || !endYear || endYear < startYear) continue;

    const firstLine =
      block
        .split('\n')
        .map((l) => l.trim())
        .find((l) => l) || '';
    const [title, company] = firstLine.split(/[—–|@]|\sat\s/i).map((s) => s.trim());

    out.push({
      title: title || firstLine.slice(0, 120),
      company: company || '',
      start: startYear,
      end: endYear,
      durationYears: Math.max(0.25, endYear - startYear),
      raw: block,
    });
  }

  return out;
}

function computeTotalYears(experiences) {
  if (experiences.length === 0) return 0;
  const intervals = experiences
    .map((e) => [e.start, e.end])
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curStart = intervals[0][0];
  let curEnd = intervals[0][1];
  for (let i = 1; i < intervals.length; i++) {
    const [s, e] = intervals[i];
    if (s <= curEnd) {
      curEnd = Math.max(curEnd, e);
    } else {
      total += curEnd - curStart;
      curStart = s;
      curEnd = e;
    }
  }
  total += curEnd - curStart;
  return Math.max(0, total);
}

function computeSkillRecency(skills, experiences, fullText, now) {
  const map = {};
  const currentYear = now.getFullYear();
  for (const skill of skills) {
    const mostRecent = findMostRecentMention(skill.name, experiences);
    if (mostRecent === null) {
      map[skill.name] = 0.5;
      continue;
    }
    const yearsAgo = currentYear - mostRecent;
    if (yearsAgo < 2) map[skill.name] = 1.0;
    else if (yearsAgo < 5) map[skill.name] = 0.6;
    else map[skill.name] = 0.3;
  }
  for (const s of skills) s.recency = map[s.name] ?? 0.5;
  return map;
}

function findMostRecentMention(skillName, experiences) {
  let bestEnd = null;
  const re = new RegExp(
    `\\b${skillName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
    'i'
  );
  for (const exp of experiences) {
    if (re.test(exp.raw)) {
      if (bestEnd === null || exp.end > bestEnd) bestEnd = exp.end;
    }
  }
  return bestEnd;
}

function extractEducation(text) {
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const out = [];
  const degreeRe = /\b(b\.?\s?s\.?|b\.?\s?a\.?|m\.?\s?s\.?|m\.?\s?b\.?\s?a\.?|ph\.?\s?d\.?|bachelor[s']?|master[s']?|doctorate|associate)\b/i;
  for (const line of lines) {
    if (degreeRe.test(line)) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      out.push({
        degree: line,
        school: '',
        year: yearMatch ? parseInt(yearMatch[0], 10) : null,
      });
    }
  }
  return out;
}

function extractCertifications(text) {
  if (!text) return [];
  const certPatterns = [
    /aws certified[^,\n]*/gi,
    /azure (?:fundamentals|administrator|developer|architect)[^,\n]*/gi,
    /google cloud (?:certified|professional)[^,\n]*/gi,
    /pmp\b/gi,
    /scrum master[^,\n]*/gi,
    /cissp\b/gi,
    /oracle certified[^,\n]*/gi,
    /comptia[^,\n]*/gi,
    /certified kubernetes[^,\n]*/gi,
  ];
  const set = new Set();
  for (const re of certPatterns) {
    const matches = text.match(re) || [];
    for (const m of matches) set.add(m.trim());
  }
  return [...set];
}

function extractSoftSkills(text) {
  const lower = text.toLowerCase();
  const set = new Set();
  for (const s of SOFT_SKILLS) {
    if (lower.includes(s)) set.add(s.replace('-', ' '));
  }
  return [...set];
}
