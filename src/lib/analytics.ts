// ============================================================
// Ramadan Companion — Analytics Interaction Events
// Lightweight trackEvent helper that sends to GA4 + Mixpanel.
// All events are no-ops when analytics isn't loaded.
// ============================================================

type EventProps = Record<string, string | number | boolean>;

/**
 * Track a user interaction event across all configured analytics providers.
 * Safe to call anywhere — silently no-ops if providers aren't loaded.
 */
export function trackEvent(name: string, props?: EventProps): void {
  if (typeof window === "undefined") return;

  // Dev logging
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${name}`, props ?? {});
  }

  // Google Analytics 4
  if ("gtag" in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag("event", name, {
      event_category: "Interaction",
      ...props,
    });
  }

  // Mixpanel
  if ("mixpanel" in window) {
    const mixpanel = (
      window as unknown as {
        mixpanel: { track: (name: string, props?: object) => void };
      }
    ).mixpanel;
    mixpanel.track(name, props);
  }
}

// ── Pre-defined Event Names (typed constants) ────────────────

export const AnalyticsEvents = {
  // Setup
  SETUP_COMPLETED: "setup_completed",
  SETUP_PACK_SELECTED: "setup_pack_selected",

  // Daily tracking
  BASIC_TOGGLED: "basic_toggled",
  HABIT_COMPLETED: "habit_completed",
  MONTHLY_GOAL_UPDATED: "monthly_goal_updated",
  REFLECTION_WRITTEN: "reflection_written",
  DAY_OPENED: "day_opened",
  DAY_SAVED: "day_saved",

  // Milestones
  STREAK_MILESTONE: "streak_milestone",
  PHASE_CEREMONY_VIEWED: "phase_ceremony_viewed",
  CELEBRATION_TRIGGERED: "celebration_triggered",
  PERFECT_DAY: "perfect_day",

  // Features
  SHARE_CARD_GENERATED: "share_card_generated",
  SHARE_CARD_SHARED: "share_card_shared",
  DATA_EXPORTED: "data_exported",
  DATA_IMPORTED: "data_imported",
  SETTINGS_CHANGED: "settings_changed",

  // Engagement
  MENU_OPENED: "menu_opened",
  BANNER_DISMISSED: "banner_dismissed",
  BANNER_VIEWED: "banner_viewed",
  INSTALL_PROMPT_SHOWN: "install_prompt_shown",
  APP_INSTALLED: "app_installed",

  // Audio
  QURAN_AUDIO_PLAYED: "quran_audio_played",
  QURAN_AUDIO_PAUSED: "quran_audio_paused",

  // Onboarding
  ONBOARDING_STARTED: "onboarding_started",
  ONBOARDING_COMPLETED: "onboarding_completed",
  ONBOARDING_SKIPPED: "onboarding_skipped",
} as const;
