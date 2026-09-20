import { useState, useEffect, useCallback } from 'react';

export function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash.slice(1) || '/');

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { route, navigate };
}

export function parseRoute(route: string): { path: string; segments: string[] } {
  const clean = route.split('?')[0];
  const segments = clean.split('/').filter(Boolean);
  return { path: clean, segments };
}
