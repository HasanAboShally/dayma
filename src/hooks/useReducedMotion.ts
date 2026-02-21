// ============================================================
// useReducedMotion — Respects prefers-reduced-motion
// Returns true when the user prefers reduced motion.
// Use to disable/simplify Framer Motion animations.
// ============================================================

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Returns `true` when the user has enabled "Reduce motion" in
 * their OS accessibility settings. Components should use this
 * to skip elaborate animations while keeping basic transitions.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
