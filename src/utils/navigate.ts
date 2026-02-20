/**
 * Programmatic navigation that works with Astro View Transitions.
 * Dispatches a custom event caught by the layout's Astro script,
 * which calls `navigate()` from `astro:transitions/client`.
 */
export function navigateTo(url: string): void {
  document.dispatchEvent(new CustomEvent("app:navigate", { detail: { url } }));
}
