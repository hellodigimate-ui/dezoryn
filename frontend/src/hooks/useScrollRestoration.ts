/**
 * useScrollRestoration
 *
 * Saves the window scroll position to sessionStorage keyed by the current
 * history entry (route path + history.state index) just before the user
 * navigates away, and restores it after a popstate (Back/Forward) event
 * causes the page to re-render.
 *
 * Rules:
 *  - Forward / normal navigation → always scrolls to top (existing behaviour).
 *  - Back / Forward (popstate)   → restores the saved Y position for that entry.
 *  - Refresh                     → restores the position saved for this entry.
 */

import { useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = '__scroll_pos__';

/** Generate a stable key for a history entry. */
function getEntryKey(path: string, idx: number): string {
  return `${STORAGE_KEY_PREFIX}${path}__${idx}`;
}

/** Read the monotonically-increasing history index from state, or fall back to 0. */
function getHistoryIndex(): number {
  return (window.history.state as { __scrollIdx?: number } | null)?.__scrollIdx ?? 0;
}

/** Attach a scroll-index to the history state without changing the URL. */
function ensureHistoryIndex(idx: number): void {
  const current = window.history.state ?? {};
  if ((current as { __scrollIdx?: number }).__scrollIdx === undefined) {
    window.history.replaceState({ ...(current as object), __scrollIdx: idx }, '');
  }
}

let _nextIdx = 1; // global monotonic counter so each pushState gets a unique index

/**
 * useScrollRestoration
 * @param currentRoute  The current app route string (e.g. '/', '/marketplace').
 *                      Must change when the displayed page changes so the hook
 *                      can detect a route transition.
 * @param isPopState    Pass true when the route change was caused by a
 *                      popstate event (Back/Forward). Pass false for normal
 *                      forward navigation.
 */
export function useScrollRestoration(
  currentRoute: string,
  isPopState: boolean
): void {
  // Track whether the most recent navigation was a popstate
  const isPopRef = useRef(false);
  // Track the history index of the entry we are currently on
  const currentIdxRef = useRef(getHistoryIndex());
  // Track the previous route so we can save scroll before leaving
  const prevRouteRef = useRef(currentRoute);
  // Track the previous history index so we can save scroll before leaving
  const prevIdxRef = useRef(currentIdxRef.current);

  // On mount: stamp current history entry with an index if it doesn't have one
  useEffect(() => {
    ensureHistoryIndex(currentIdxRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Intercept pushState so every forward navigation gets a unique index
  useEffect(() => {
    const origPushState = window.history.pushState.bind(window.history);
    window.history.pushState = function (state: unknown, title: string, url?: string | URL | null) {
      const idx = _nextIdx++;
      const newState = { ...(typeof state === 'object' && state !== null ? state : {}), __scrollIdx: idx };
      origPushState(newState, title, url);
    };

    return () => {
      window.history.pushState = origPushState;
    };
  }, []);

  // Keep isPopRef in sync with the prop
  useEffect(() => {
    isPopRef.current = isPopState;
  }, [isPopState]);

  // When the route changes: save scroll for the page we are LEAVING, then
  // either restore scroll for the page we are ENTERING (popstate) or scroll
  // to top (forward navigation).
  useEffect(() => {
    const newIdx = getHistoryIndex();

    if (prevRouteRef.current !== currentRoute) {
      // Save scroll for the page we are leaving
      const oldKey = getEntryKey(prevRouteRef.current, prevIdxRef.current);
      sessionStorage.setItem(oldKey, String(Math.round(window.scrollY)));

      if (isPopRef.current) {
        // Restore scroll for the page we are returning to
        const restoreKey = getEntryKey(currentRoute, newIdx);
        const saved = sessionStorage.getItem(restoreKey);

        if (saved !== null) {
          const targetY = parseInt(saved, 10);
          // Use rAF + small timeout to wait for React to paint the restored page
          requestAnimationFrame(() => {
            setTimeout(() => {
              window.scrollTo({ top: targetY, behavior: 'instant' });
            }, 80);
          });
        } else {
          // No saved position for this entry - go to top
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
      // For normal forward navigation, router.ts already calls scrollTo(top)

      prevRouteRef.current = currentRoute;
      prevIdxRef.current = newIdx;
      currentIdxRef.current = newIdx;
    }
  }, [currentRoute]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save scroll when the user is about to leave the page entirely
  useEffect(() => {
    const handleBeforeUnload = () => {
      const key = getEntryKey(prevRouteRef.current, prevIdxRef.current);
      sessionStorage.setItem(key, String(Math.round(window.scrollY)));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);
}
