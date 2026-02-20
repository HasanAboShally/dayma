// ============================================================
// Ramadan Companion — Core Types (v4 — Two-Layer Model)
// Layer 1: Daily Habits (Basics + user picks, always daily)
// Layer 2: Monthly Goals (numeric targets, can exceed)
// ============================================================

import type { IconName } from "./icons";

// ── Locale ───────────────────────────────────────────────────

export type AppLocale = "en" | "ar";

// ── Worship Categories ───────────────────────────────────────

export type WorshipCategory =
  | "quran"
  | "prayer"
  | "dhikr"
  | "charity"
  | "dua"
  | "fasting"
  | "learning";

// ── Layer 1a: Basics (auto-checked, uncheck if missed) ───────

/**
 * A fundamental daily worship action (5 prayers + fasting).
 * These are auto-checked each day — user unchecks if missed.
 */
export interface BasicAction {
  id: string;
  titleKey: string;
  titleAr: string;
  iconName: IconName;
  category: "prayer" | "fasting";
}

// ── Layer 1b: Daily Habits (user picks from gallery) ─────────

/**
 * A worship action the user has chosen to track every day.
 * No frequency complexity — everything is daily.
 * Can originate from the curated gallery or be fully custom.
 */
export interface DailyHabit {
  id: string;
  titleKey: string;
  descriptionKey: string;
  category: WorshipCategory;
  iconName?: IconName;
  target?: number;
  unitKey?: string;
  source: "gallery" | "custom";
  enabled: boolean;
  addedAt: string;
}

// ── Layer 2: Monthly Goals (numeric targets) ─────────────────

/**
 * A bigger-picture worship goal for the entire month of Ramadan.
 * Has a numeric target (e.g., "Visit Al-Aqsa 5 times").
 * Progress is tracked per-day (which days the goal was done).
 * Users CAN exceed their target — that's celebrated, not capped.
 */
export interface MonthlyGoal {
  id: string;
  titleKey: string;
  titleAr: string;
  descriptionKey: string;
  descriptionAr: string;
  iconName: IconName;
  category: WorshipCategory;
  /** How many times this month (e.g., 5 times) */
  target: number;
  /** Source: from curated gallery or user-created */
  source: "gallery" | "custom";
}

// ── Day Entry (two layers) ───────────────────────────────────

export interface DayEntry {
  /** Layer 1a: Basics — default ALL true, user sets false if missed */
  basics: Record<string, boolean>;
  /** Layer 1b: Daily habits — user checks when done */
  completions: Record<string, boolean>;
  /** Layer 2: Monthly goals — count per day (number) or legacy boolean */
  monthlyGoalCompletions: Record<string, number | boolean>;
  /** Optional daily reflection */
  reflection?: string;
}

// ── App State v4 ─────────────────────────────────────────────

export const APP_STATE_VERSION = 4;

export interface AppState {
  version: number;
  locale: AppLocale;
  setupComplete: boolean;
  /** Ramadan start date (YYYY-MM-DD) for the 30-day hex grid */
  ramadanStartDate: string;
  /** Which basics are enabled (IDs) — defaults to all 6 */
  enabledBasics: string[];
  /** User's daily habits (picked from gallery, always daily) */
  dailyHabits: DailyHabit[];
  /** User's monthly goals (with numeric targets) */
  monthlyGoals: MonthlyGoal[];
  /** Daily entries keyed by date string (YYYY-MM-DD) */
  days: Record<string, DayEntry>;
}

// ── Hex Grid Types ───────────────────────────────────────────

export type HexDayStatus =
  | "future"
  | "today"
  | "past-empty"
  | "past-partial"
  | "past-good"
  | "past-perfect";

export interface HexDay {
  day: number;
  date: string;
  status: HexDayStatus;
  completionPercent: number;
}
