import { useCallback, useEffect, useState } from 'react';

/**
 * Tiny localStorage-backed state hook. Used by components that want their own
 * persistence (e.g. JD draft) outside the main Zustand store.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota errors etc. — silently ignore */
    }
  }, [key, value]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset];
}
