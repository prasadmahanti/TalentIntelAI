import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROLE_JD_TEMPLATES } from '../utils/roleTemplates.js';

/**
 * Global store for the analyzer.
 *
 * Persisted state:
 *  - resumes:        ResumeRecord[]            - all uploaded resumes (each with embedded role + jd at upload time)
 *  - activeResumeId: string | null
 *  - activeRoleId:   string | null             - the currently selected role on the Upload page
 *  - jdByRole:       Record<roleId, string>    - editable JDs per role (defaults seeded from templates)
 *  - hiredIds:       string[]                  - resume IDs marked as Hired
 *  - jobDescription: string                    - free-form JD on the Match page (non-role-bound)
 *  - settings:       { blindHiring, openAiKey, openAiModel, theme, accent }
 */
export const useResumeStore = create(
  persist(
    (set, get) => ({
      resumes: [],
      activeResumeId: null,
      activeRoleId: null,
      jdByRole: { ...ROLE_JD_TEMPLATES },
      hiredIds: [],
      jobDescription: '',
      matchResult: null,
      settings: {
        blindHiring: false,
        openAiKey: '',
        openAiModel: 'gpt-4o-mini',
        theme: 'system',
        accent: 'brand',
      },

      addResume: (record) =>
        set((s) => ({
          resumes: [...s.resumes, record],
          activeResumeId: record.id,
        })),

      updateResume: (id, patch) =>
        set((s) => ({
          resumes: s.resumes.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      removeResume: (id) =>
        set((s) => {
          const remaining = s.resumes.filter((r) => r.id !== id);
          return {
            resumes: remaining,
            activeResumeId:
              s.activeResumeId === id ? remaining[0]?.id ?? null : s.activeResumeId,
            hiredIds: s.hiredIds.filter((h) => h !== id),
          };
        }),

      setActiveResume: (id) => set({ activeResumeId: id }),

      setActiveRole: (roleId) => set({ activeRoleId: roleId }),

      setJdForRole: (roleId, jd) =>
        set((s) => ({ jdByRole: { ...s.jdByRole, [roleId]: jd } })),

      resetJdForRole: (roleId) =>
        set((s) => ({
          jdByRole: { ...s.jdByRole, [roleId]: ROLE_JD_TEMPLATES[roleId] || '' },
        })),

      setHired: (id, hired) =>
        set((s) => {
          const set2 = new Set(s.hiredIds);
          if (hired) set2.add(id);
          else set2.delete(id);
          return { hiredIds: [...set2] };
        }),

      setJobDescription: (jd) => set({ jobDescription: jd }),
      setMatchResult: (result) => set({ matchResult: result }),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      clearAll: () =>
        set({
          resumes: [],
          activeResumeId: null,
          jobDescription: '',
          matchResult: null,
          hiredIds: [],
        }),

      getActiveResume: () => {
        const { resumes, activeResumeId } = get();
        return resumes.find((r) => r.id === activeResumeId) ?? null;
      },

      isHired: (id) => get().hiredIds.includes(id),

      getStats: () => {
        const { resumes, hiredIds } = get();
        const matched = resumes.filter((r) => (r.matchPercentage ?? 0) >= 60).length;
        const activeJobs = new Set(resumes.map((r) => r.roleId).filter(Boolean)).size;
        return {
          totalResumes: resumes.length,
          activeJobs,
          matched,
          hired: hiredIds.length,
        };
      },
    }),
    {
      name: 'ai-resume-analyzer-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        activeRoleId: state.activeRoleId,
        jdByRole: state.jdByRole,
        hiredIds: state.hiredIds,
        jobDescription: state.jobDescription,
        settings: state.settings,
      }),
      migrate: (state) => ({
        ...state,
        jdByRole: { ...ROLE_JD_TEMPLATES, ...(state?.jdByRole || {}) },
        hiredIds: state?.hiredIds || [],
        activeRoleId: state?.activeRoleId || null,
        settings: {
          theme: 'system',
          accent: 'brand',
          blindHiring: false,
          openAiKey: '',
          openAiModel: 'gpt-4o-mini',
          ...(state?.settings || {}),
        },
      }),
      version: 2,
    }
  )
);
