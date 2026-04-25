import { create } from 'zustand';

export const useAuthStore = create((set) => {
  // Load persisted state if exists
  const isServer = typeof window === 'undefined';
  let initialAuth = { isAuthenticated: false, user: null, token: null };
  if (!isServer) {
    try {
      const stored = localStorage.getItem('talent-intel-auth');
      if (stored) {
        initialAuth = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }

  return {
    ...initialAuth,
    loginSuccess: (user, token) => {
      const state = { isAuthenticated: true, user, token };
      localStorage.setItem('talent-intel-auth', JSON.stringify(state));
      set(state);
    },
    logout: () => {
      localStorage.removeItem('talent-intel-auth');
      set({ isAuthenticated: false, user: null, token: null });
    }
  };
});
