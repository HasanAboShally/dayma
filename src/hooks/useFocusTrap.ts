// ============================================================
// useFocusTrap — Keyboard focus trap for modals & drawers
// Traps Tab/Shift+Tab within the container while active.
// Returns a ref to attach to the container element.
// ============================================================

import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps keyboard focus within a container element.
 * Attach the returned ref to the wrapping `<div>`.
 *
 * @param active - Whether the trap is currently active
 * @param restoreFocus - Restore focus to the previously focused element on deactivate (default: true)
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  active: boolean,
  restoreFocus = true,
) {
  const containerRef = useRef<T>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;

    // Remember what was focused before the trap activated
    previousFocusRef.current = document.activeElement as HTMLElement;

    const el = containerRef.current;
    if (!el) return;

    // Delay to let the DOM render
    const focusTimer = setTimeout(() => {
      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
      focusable[0]?.focus();
    }, 50);

    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusable = el.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !el.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !el.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handler);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("keydown", handler);

      // Restore previous focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return containerRef;
}
