/**
 * Skills taxonomy + synonym graph.
 *
 * This file drives both the parser (what counts as a "skill") and the matcher
 * (what counts as semantically equivalent). It's intentionally a static data file
 * so we get good results offline / without an embedding API.
 *
 * Each entry maps a *canonical* skill name to:
 *   - aliases: alternate spellings / abbreviations the parser should recognise
 *   - related: concepts that should match each other in semantic matching
 *   - category: bucket used for the radar chart (5–8 categories total works best)
 */

export const SKILL_DATABASE = {
  // --- Languages ---
  JavaScript: { aliases: ['js', 'java script', 'es6', 'ecmascript'], related: ['TypeScript', 'Node.js'], category: 'Languages' },
  TypeScript: { aliases: ['ts'], related: ['JavaScript'], category: 'Languages' },
  Python: { aliases: ['python3', 'py'], related: ['Django', 'Flask', 'FastAPI'], category: 'Languages' },
  Java: { aliases: [], related: ['Spring', 'Spring Boot', 'Kotlin'], category: 'Languages' },
  Kotlin: { aliases: [], related: ['Java', 'Android'], category: 'Languages' },
  Go: { aliases: ['golang'], related: [], category: 'Languages' },
  Rust: { aliases: [], related: [], category: 'Languages' },
  'C#': { aliases: ['c sharp', 'csharp', 'dotnet', '.net'], related: ['.NET'], category: 'Languages' },
  'C++': { aliases: ['cpp', 'cplusplus'], related: [], category: 'Languages' },
  Ruby: { aliases: [], related: ['Rails'], category: 'Languages' },
  PHP: { aliases: [], related: ['Laravel'], category: 'Languages' },
  Swift: { aliases: [], related: ['iOS'], category: 'Languages' },
  SQL: { aliases: [], related: ['PostgreSQL', 'MySQL', 'SQL Server'], category: 'Languages' },

  // --- Frontend ---
  React: { aliases: ['reactjs', 'react.js'], related: ['Redux', 'Next.js', 'JavaScript'], category: 'Frontend' },
  'Next.js': { aliases: ['nextjs'], related: ['React'], category: 'Frontend' },
  Vue: { aliases: ['vuejs', 'vue.js'], related: ['Nuxt'], category: 'Frontend' },
  Angular: { aliases: ['angularjs', 'angular2+'], related: ['TypeScript', 'RxJS'], category: 'Frontend' },
  Svelte: { aliases: ['sveltekit'], related: [], category: 'Frontend' },
  HTML: { aliases: ['html5'], related: [], category: 'Frontend' },
  CSS: { aliases: ['css3'], related: ['Sass', 'Tailwind'], category: 'Frontend' },
  Tailwind: { aliases: ['tailwindcss', 'tailwind css'], related: ['CSS'], category: 'Frontend' },
  Sass: { aliases: ['scss'], related: ['CSS'], category: 'Frontend' },
  Redux: { aliases: [], related: ['React'], category: 'Frontend' },

  // --- Backend / Frameworks ---
  'Node.js': { aliases: ['nodejs', 'node'], related: ['Express', 'JavaScript'], category: 'Backend' },
  Express: { aliases: ['expressjs', 'express.js'], related: ['Node.js'], category: 'Backend' },
  Django: { aliases: [], related: ['Python'], category: 'Backend' },
  Flask: { aliases: [], related: ['Python'], category: 'Backend' },
  FastAPI: { aliases: [], related: ['Python'], category: 'Backend' },
  Spring: { aliases: ['spring boot', 'springboot'], related: ['Java'], category: 'Backend' },
  Rails: { aliases: ['ruby on rails', 'ror'], related: ['Ruby'], category: 'Backend' },
  Laravel: { aliases: [], related: ['PHP'], category: 'Backend' },
  '.NET': { aliases: ['dotnet', 'asp.net'], related: ['C#'], category: 'Backend' },
  GraphQL: { aliases: [], related: ['REST'], category: 'Backend' },
  REST: { aliases: ['rest api', 'restful'], related: ['GraphQL'], category: 'Backend' },

  // --- Databases ---
  PostgreSQL: { aliases: ['postgres'], related: ['SQL'], category: 'Databases' },
  MySQL: { aliases: [], related: ['SQL'], category: 'Databases' },
  'SQL Server': { aliases: ['mssql', 'microsoft sql server'], related: ['SQL'], category: 'Databases' },
  MongoDB: { aliases: ['mongo'], related: ['NoSQL'], category: 'Databases' },
  Redis: { aliases: [], related: [], category: 'Databases' },
  DynamoDB: { aliases: [], related: ['AWS', 'NoSQL'], category: 'Databases' },
  Elasticsearch: { aliases: ['elastic search', 'elk'], related: [], category: 'Databases' },
  NoSQL: { aliases: [], related: ['MongoDB', 'DynamoDB'], category: 'Databases' },

  // --- Cloud / Infra (this is the "Cloud Infrastructure" semantic group) ---
  AWS: {
    aliases: ['amazon web services', 'aws cloud'],
    related: ['Cloud Infrastructure', 'EC2', 'S3', 'Lambda', 'DynamoDB'],
    category: 'Cloud',
  },
  Azure: {
    aliases: ['microsoft azure'],
    related: ['Cloud Infrastructure'],
    category: 'Cloud',
  },
  GCP: {
    aliases: ['google cloud', 'google cloud platform'],
    related: ['Cloud Infrastructure'],
    category: 'Cloud',
  },
  'Cloud Infrastructure': {
    aliases: ['cloud computing', 'cloud platform', 'cloud services'],
    related: ['AWS', 'Azure', 'GCP'],
    category: 'Cloud',
  },
  Docker: { aliases: [], related: ['Kubernetes', 'DevOps'], category: 'DevOps' },
  Kubernetes: { aliases: ['k8s'], related: ['Docker', 'DevOps'], category: 'DevOps' },
  Terraform: { aliases: [], related: ['DevOps', 'Infrastructure as Code'], category: 'DevOps' },
  'CI/CD': { aliases: ['cicd', 'continuous integration', 'continuous deployment'], related: ['DevOps', 'Jenkins', 'GitHub Actions'], category: 'DevOps' },
  Jenkins: { aliases: [], related: ['CI/CD'], category: 'DevOps' },
  'GitHub Actions': { aliases: [], related: ['CI/CD'], category: 'DevOps' },
  DevOps: { aliases: [], related: ['Docker', 'Kubernetes', 'CI/CD'], category: 'DevOps' },
  Linux: { aliases: ['unix'], related: ['Bash'], category: 'DevOps' },

  // --- Data / ML ---
  'Machine Learning': { aliases: ['ml'], related: ['TensorFlow', 'PyTorch', 'Deep Learning'], category: 'Data/ML' },
  'Deep Learning': { aliases: ['dl'], related: ['Machine Learning'], category: 'Data/ML' },
  TensorFlow: { aliases: [], related: ['Machine Learning'], category: 'Data/ML' },
  PyTorch: { aliases: [], related: ['Machine Learning'], category: 'Data/ML' },
  Pandas: { aliases: [], related: ['Python'], category: 'Data/ML' },
  NumPy: { aliases: [], related: ['Python'], category: 'Data/ML' },
  Spark: { aliases: ['apache spark'], related: ['Big Data'], category: 'Data/ML' },
  Tableau: { aliases: [], related: [], category: 'Data/ML' },
  'Power BI': { aliases: ['powerbi'], related: [], category: 'Data/ML' },

  // --- Tools / Practices ---
  Git: { aliases: ['github', 'gitlab', 'bitbucket'], related: [], category: 'Tools' },
  Agile: { aliases: ['scrum', 'kanban'], related: [], category: 'Tools' },
  Jira: { aliases: [], related: ['Agile'], category: 'Tools' },
  Figma: { aliases: [], related: ['UI/UX'], category: 'Tools' },
  'UI/UX': { aliases: ['ui design', 'ux design', 'user experience'], related: [], category: 'Tools' },
};

/** Soft skills — the parser scans for these in summary / experience descriptions. */
export const SOFT_SKILLS = [
  'communication',
  'leadership',
  'teamwork',
  'collaboration',
  'problem solving',
  'problem-solving',
  'analytical',
  'critical thinking',
  'time management',
  'adaptability',
  'creativity',
  'mentoring',
  'public speaking',
  'negotiation',
  'attention to detail',
  'self-starter',
  'cross-functional',
];

/** Common gendered / coded language we strip out under the Blind Hiring toggle. */
export const CODED_LANGUAGE = [
  'rockstar',
  'ninja',
  'guru',
  'aggressive',
  'dominant',
  'manpower',
  'chairman',
  'salesman',
  'craftsman',
];

/** Build a flat alias→canonical map (lower-cased) once for fast lookups. */
let _aliasIndex = null;
export function getAliasIndex() {
  if (_aliasIndex) return _aliasIndex;
  const idx = new Map();
  for (const [canonical, info] of Object.entries(SKILL_DATABASE)) {
    idx.set(canonical.toLowerCase(), canonical);
    for (const alias of info.aliases) idx.set(alias.toLowerCase(), canonical);
  }
  _aliasIndex = idx;
  return idx;
}

/**
 * Returns true if `a` and `b` should be considered the same skill semantically —
 * either identical, alias of each other, or in each other's `related` list.
 * This is our poor-man's-embeddings semantic match.
 */
export function isRelated(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const aInfo = SKILL_DATABASE[a];
  const bInfo = SKILL_DATABASE[b];
  if (aInfo?.related?.includes(b)) return true;
  if (bInfo?.related?.includes(a)) return true;
  return false;
}

/** Ordered list of category names — drives axis order on the radar chart. */
export const CATEGORIES = ['Languages', 'Frontend', 'Backend', 'Databases', 'Cloud', 'DevOps', 'Data/ML', 'Tools'];
