import { useCallback, useEffect } from 'react';
import { useResumeStore } from '../store/useResumeStore.js';

/**
 * Theme hook with three modes - 'light', 'dark', 'system' - plus an accent color.
 *
 *  - mode = 'system' follows the OS preference and updates live when it changes.
 *  - The accent (brand|emerald|violet|rose|amber) is applied via a `data-accent` attribute on <html>
 *    which downstream components read implicitly through Tailwind classes.
 */
export function useTheme() {
  const settings = useResumeStore((s) => s.settings);
  const updateSettings = useResumeStore((s) => s.updateSettings);

  const mode = settings.theme || 'system';
  const accent = settings.accent || 'brand';

  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = mode === 'dark' || (mode === 'system' && prefersDark);
      root.classList.toggle('dark', dark);
      root.setAttribute('data-theme', dark ? 'dark' : 'light');
      root.setAttribute('data-accent', accent);
      localStorage.setItem('rb-theme', dark ? 'dark' : 'light');
    };
    apply();
    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [mode, accent]);

  const setMode = useCallback((m) => updateSettings({ theme: m }), [updateSettings]);
  const setAccent = useCallback((a) => updateSettings({ accent: a }), [updateSettings]);
  const cycle = useCallback(() => {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    updateSettings({ theme: next });
  }, [mode, updateSettings]);

  return { mode, accent, setMode, setAccent, cycle };
}
