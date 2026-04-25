/**
 * Predefined editable Job Descriptions per business role.
 *
 * The Upload page lets the user pick a role, pre-fills the JD textarea with the template
 * below, and the user can edit before uploading a resume. The edited JD is then persisted
 * per-role in the Zustand store, so it survives reloads.
 */

export const ROLES = [
  {
    id: 'full-stack',
    label: 'Full Stack',
    icon: 'Layers',
    color: 'brand',
    description: 'Frontend + backend engineer building end-to-end features.',
  },
  {
    id: 'qa-automation',
    label: 'QA Automation',
    icon: 'Bug',
    color: 'emerald',
    description: 'Test automation, CI quality gates, and end-to-end frameworks.',
  },
  {
    id: 'data-ai',
    label: 'Data & AI',
    icon: 'Brain',
    color: 'violet',
    description: 'ML engineering, data pipelines, and applied AI.',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: 'DollarSign',
    color: 'amber',
    description: 'Financial analysis, modeling, and reporting.',
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: 'Megaphone',
    color: 'rose',
    description: 'Growth, campaign management, content, and analytics.',
  },
];

export const ROLE_JD_TEMPLATES = {
  'full-stack': `Full Stack Engineer

About the role:
We are looking for a Full Stack Engineer with 4+ years of experience shipping production web applications. You'll work across the stack - designing APIs, building React UIs, and operating cloud infrastructure.

Required skills:
- Strong JavaScript and TypeScript
- React (hooks, state management)
- Node.js with Express or NestJS
- SQL (PostgreSQL or MySQL) and at least one NoSQL store
- REST and/or GraphQL API design
- Docker, CI/CD pipelines
- Cloud Infrastructure (AWS, Azure, or GCP)

Nice to have:
- Next.js, GraphQL
- Kubernetes
- Performance profiling and observability
- Mentoring junior engineers
`,
  'qa-automation': `QA Automation Engineer

About the role:
We're hiring a QA Automation Engineer to own our end-to-end and integration test suites. You'll partner with developers to bake quality into the pipeline and shorten feedback loops.

Required skills:
- 3+ years in test automation (web or mobile)
- Selenium, Playwright, or Cypress
- Strong scripting in Python or JavaScript
- REST API testing (Postman, RestAssured)
- CI/CD experience (Jenkins, GitHub Actions)
- SQL for data validation
- Agile / Scrum delivery

Nice to have:
- Performance testing (JMeter, k6)
- Mobile automation (Appium)
- Docker
- Security testing fundamentals
`,
  'data-ai': `Data & AI Engineer

About the role:
We're looking for a Data & AI Engineer to build production ML systems and the data pipelines that feed them. You'll work end-to-end: data ingestion, feature engineering, model training, and serving.

Required skills:
- Strong Python (Pandas, NumPy)
- Machine Learning fundamentals
- Deep Learning with TensorFlow or PyTorch
- SQL and at least one big-data tool (Spark, BigQuery)
- Cloud Infrastructure (AWS, GCP, or Azure)
- Docker, CI/CD
- Experience deploying models to production

Nice to have:
- LLM / generative AI experience
- MLOps tooling (MLflow, Kubeflow)
- Streaming systems (Kafka)
- Data visualization (Tableau, Power BI)
`,
  finance: `Finance Analyst

About the role:
We are seeking a Finance Analyst to support FP&A, build models, and partner with business stakeholders. You'll turn data into decisions.

Required skills:
- 3+ years in finance or FP&A
- Advanced Excel / financial modeling
- Strong SQL for ad-hoc analysis
- Experience with ERP or accounting systems
- Variance analysis, budgeting, forecasting
- Communication and stakeholder management
- Attention to detail

Nice to have:
- Power BI or Tableau
- Python for financial analysis
- CFA / CPA or progress toward
- Exposure to SaaS metrics (ARR, churn, LTV)
`,
  marketing: `Marketing Manager

About the role:
We're hiring a Marketing Manager to own multi-channel growth campaigns. You'll plan, launch, measure, and iterate.

Required skills:
- 4+ years in B2B or B2C marketing
- SEO and content strategy
- Marketing analytics (Google Analytics, attribution)
- Email marketing platforms (HubSpot, Marketo)
- Strong communication and creative direction
- Cross-functional collaboration

Nice to have:
- HTML / CSS basics for landing pages
- A/B testing experience
- Figma for creative reviews
- Performance marketing budgets ($1M+)
`,
};

export function getRole(id) {
  return ROLES.find((r) => r.id === id) || null;
}

export function getDefaultJd(roleId) {
  return ROLE_JD_TEMPLATES[roleId] || '';
}
