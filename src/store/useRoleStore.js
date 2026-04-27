import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROLES, ROLE_JD_TEMPLATES } from '../utils/roleTemplates.js';

// Seed default roles from static templates so they appear immediately
const DEFAULT_ROLES = ROLES.map((r) => ({
  ...r,
  skills: defaultSkillsFor(r.id),
  jobDescription: ROLE_JD_TEMPLATES[r.id] || '',
  createdAt: new Date().toISOString(),
}));

function defaultSkillsFor(id) {
  const map = {
    'full-stack':    'JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS',
    'qa-automation': 'Selenium, Playwright, Cypress, Python, Postman, Jenkins, SQL',
    'data-ai':       'Python, Pandas, NumPy, TensorFlow, PyTorch, SQL, Spark, MLflow',
    'finance':       'Excel, SQL, Power BI, Financial Modeling, ERP, Forecasting',
    'marketing':     'SEO, Google Analytics, HubSpot, A/B Testing, Content Strategy',
  };
  return map[id] || '';
}

export const useRoleStore = create(
  persist(
    (set, get) => ({
      roles: DEFAULT_ROLES,

      addRole: (role) =>
        set((s) => ({
          roles: [
            ...s.roles,
            {
              ...role,
              id: `custom-${crypto.randomUUID()}`,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updateRole: (id, patch) =>
        set((s) => ({
          roles: s.roles.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      deleteRole: (id) =>
        set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),

      getRoleById: (id) => get().roles.find((r) => r.id === id) || null,
    }),
    {
      name: 'talentintel-roles',
      storage: createJSONStorage(() => localStorage),
      // Only migrate if there are no roles yet (first time)
      migrate: (state) => ({
        ...state,
        roles: state?.roles?.length ? state.roles : DEFAULT_ROLES,
      }),
      version: 1,
    }
  )
);
