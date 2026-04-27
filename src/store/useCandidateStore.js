import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCandidateStore = create(
  persist(
    (set, get) => ({
      candidates: [],
      addCandidate: (candidate) => set((state) => ({
        candidates: [...state.candidates, { ...candidate, id: crypto.randomUUID() }]
      })),
      updateCandidate: (id, updatedData) => set((state) => ({
        candidates: state.candidates.map(c => c.id === id ? { ...c, ...updatedData } : c)
      })),
      deleteCandidate: (id) => set((state) => ({
        candidates: state.candidates.filter(c => c.id !== id)
      })),
    }),
    {
      name: 'talentintel-hr-candidates', // unique name
      storage: createJSONStorage(() => localStorage), 
    }
  )
);
