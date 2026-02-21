// ============================================================
// Ramadan Companion — State Management (v4 — Two-Layer)
// Pure functions operating on AppState. No React hooks here.
// ============================================================

import type {
  AppLocale,
  AppState,
  DailyHabit,
  DayEntry,
  HexDay,
  HexDayStatus,
  MonthlyGoal,
} from "./app-types";
import { APP_STATE_VERSION } from "./app-types";
import {
  ALL_BASIC_IDS,
  addDays,
  findMonthlyGoalGallery,
  getDateString,
} from "./gallery";

// ── Constants ────────────────────────────────────────────────

const STORAGE_KEY = "ramadan-companion";
const RAMADAN_DAYS = 30;

// ── Default State ────────────────────────────────────────────

export function getDefaultState(locale: AppLocale = "en"): AppState {
  return {
    version: APP_STATE_VERSION,
    locale,
    setupComplete: false,
    ramadanStartDate: "2026-02-18", // Ramadan 1447 — user can change in Setup
    enabledBasics: [...ALL_BASIC_IDS],
    dailyHabits: [],
    monthlyGoals: [],
    days: {},
  };
}

// ── Persistence ──────────────────────────────────────────────

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as any;
    if (parsed.version < 3) return migrateToV4(migrateToV3(parsed));
    if (parsed.version < 4) return migrateToV4(parsed);
    return parsed as AppState;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// ── Migration ────────────────────────────────────────────────

/** Migrate from v1/v2 → v3 (intermediate step) */
function migrateToV3(old: any): any {
  return {
    version: 3,
    locale: old.locale || "en",
    setupComplete: old.setupComplete ?? false,
    ramadanStartDate: old.ramadanStartDate || "2026-02-18",
    enabledBasics: old.enabledBasics || [...ALL_BASIC_IDS],
    actions: (old.actions || []).map((a: any) => ({
      ...a,
      source: a.source || (a.isCustom ? "custom" : "gallery"),
      addedAt: a.addedAt || new Date().toISOString(),
    })),
    weeklyGoals: old.weeklyGoals || [],
    days: Object.fromEntries(
      Object.entries(old.days || {}).map(([date, entry]: [string, any]) => [
        date,
        {
          basics:
            entry.basics ||
            Object.fromEntries(ALL_BASIC_IDS.map((id) => [id, true])),
          completions: entry.completions || {},
          weeklyCompletions: entry.weeklyCompletions || {},
          reflection: entry.reflection || "",
        },
      ]),
    ),
  };
}

/** Migrate from v3 → v4 (three-layer → two-layer) */
function migrateToV4(old: any): AppState {
  const state = getDefaultState(old.locale || "en");
  state.setupComplete = old.setupComplete ?? false;
  state.ramadanStartDate = old.ramadanStartDate || "2026-02-18";
  state.enabledBasics = old.enabledBasics || [...ALL_BASIC_IDS];

  // Convert actions → dailyHabits (strip frequency field)
  state.dailyHabits = (old.actions || []).map(
    (a: any): DailyHabit => ({
      id: a.id,
      titleKey: a.titleKey,
      descriptionKey: a.descriptionKey,
      category: a.category,
      iconName: a.iconName,
      target: a.target,
      unitKey: a.unitKey,
      source: a.source || "gallery",
      enabled: a.enabled ?? true,
      addedAt: a.addedAt || new Date().toISOString(),
    }),
  );

  // Convert weeklyGoals (string[]) → monthlyGoals (MonthlyGoal[])
  const oldGoalIds: string[] = old.weeklyGoals || [];
  state.monthlyGoals = oldGoalIds
    .map((oldId: string): MonthlyGoal | null => {
      // Map old weekly IDs to monthly IDs
      const monthlyId = oldId.replace("weekly-", "monthly-");
      const galleryItem = findMonthlyGoalGallery(monthlyId);
      if (galleryItem) {
        return {
          id: galleryItem.id,
          titleKey: galleryItem.titleKey,
          titleAr: galleryItem.titleAr,
          descriptionKey: galleryItem.descriptionKey,
          descriptionAr: galleryItem.descriptionAr,
          iconName: galleryItem.iconName,
          category: galleryItem.category,
          target: galleryItem.defaultTarget,
          source: "gallery",
        };
      }
      return null;
    })
    .filter((g): g is MonthlyGoal => g !== null);

  // Convert day entries: weeklyCompletions → monthlyGoalCompletions
  if (old.days) {
    for (const [date, entry] of Object.entries(old.days)) {
      const oldEntry = entry as any;
      const monthlyGoalCompletions: Record<string, boolean> = {};
      // Map old weekly completion keys to monthly
      if (oldEntry.weeklyCompletions) {
        for (const [key, val] of Object.entries(oldEntry.weeklyCompletions)) {
          const newKey = key.replace("weekly-", "monthly-");
          monthlyGoalCompletions[newKey] = val as boolean;
        }
      }
      state.days[date] = {
        basics:
          oldEntry.basics ||
          Object.fromEntries(ALL_BASIC_IDS.map((id) => [id, true])),
        completions: oldEntry.completions || {},
        monthlyGoalCompletions,
        reflection: oldEntry.reflection || "",
      };
    }
  }

  return state;
}

// ── Pure State Transforms ────────────────────────────────────

// -- Setup --

export function completeSetup(state: AppState): AppState {
  return { ...state, setupComplete: true };
}

export function setLocale(state: AppState, locale: AppLocale): AppState {
  return { ...state, locale };
}

export function setRamadanStartDate(state: AppState, date: string): AppState {
  return { ...state, ramadanStartDate: date };
}

// -- Basics --

export function toggleBasicEnabled(state: AppState, basicId: string): AppState {
  const enabled = state.enabledBasics.includes(basicId)
    ? state.enabledBasics.filter((id) => id !== basicId)
    : [...state.enabledBasics, basicId];
  return { ...state, enabledBasics: enabled };
}

// -- Daily Habits --

export function addHabit(state: AppState, habit: DailyHabit): AppState {
  if (state.dailyHabits.some((h) => h.id === habit.id)) return state;
  return { ...state, dailyHabits: [...state.dailyHabits, habit] };
}

export function addHabits(state: AppState, habits: DailyHabit[]): AppState {
  const existing = new Set(state.dailyHabits.map((h) => h.id));
  const newHabits = habits.filter((h) => !existing.has(h.id));
  return { ...state, dailyHabits: [...state.dailyHabits, ...newHabits] };
}

export function removeHabit(state: AppState, habitId: string): AppState {
  return {
    ...state,
    dailyHabits: state.dailyHabits.filter((h) => h.id !== habitId),
  };
}

export function toggleHabitEnabled(state: AppState, habitId: string): AppState {
  return {
    ...state,
    dailyHabits: state.dailyHabits.map((h) =>
      h.id === habitId ? { ...h, enabled: !h.enabled } : h,
    ),
  };
}

// -- Monthly Goals --

export function addMonthlyGoal(state: AppState, goal: MonthlyGoal): AppState {
  if (state.monthlyGoals.some((g) => g.id === goal.id)) return state;
  return { ...state, monthlyGoals: [...state.monthlyGoals, goal] };
}

export function removeMonthlyGoal(state: AppState, goalId: string): AppState {
  return {
    ...state,
    monthlyGoals: state.monthlyGoals.filter((g) => g.id !== goalId),
  };
}

export function setMonthlyGoals(
  state: AppState,
  goals: MonthlyGoal[],
): AppState {
  return { ...state, monthlyGoals: goals };
}

export function updateMonthlyGoalTarget(
  state: AppState,
  goalId: string,
  target: number,
): AppState {
  return {
    ...state,
    monthlyGoals: state.monthlyGoals.map((g) =>
      g.id === goalId ? { ...g, target } : g,
    ),
  };
}

// -- Day Entries --

/** Ensure a day entry exists. Basics start unchecked so users confirm each one. */
export function ensureDayEntry(state: AppState, date: string): AppState {
  if (state.days[date]) return state;
  const entry: DayEntry = {
    basics: Object.fromEntries(state.enabledBasics.map((id) => [id, false])),
    completions: {},
    monthlyGoalCompletions: {},
    reflection: "",
  };
  return { ...state, days: { ...state.days, [date]: entry } };
}

export function toggleBasicCompletion(
  state: AppState,
  date: string,
  basicId: string,
): AppState {
  const s = ensureDayEntry(state, date);
  const day = s.days[date];
  return {
    ...s,
    days: {
      ...s.days,
      [date]: {
        ...day,
        basics: { ...day.basics, [basicId]: !day.basics[basicId] },
      },
    },
  };
}

export function toggleCompletion(
  state: AppState,
  date: string,
  actionId: string,
): AppState {
  const s = ensureDayEntry(state, date);
  const day = s.days[date];
  return {
    ...s,
    days: {
      ...s.days,
      [date]: {
        ...day,
        completions: {
          ...day.completions,
          [actionId]: !day.completions[actionId],
        },
      },
    },
  };
}

export function toggleMonthlyGoalCompletion(
  state: AppState,
  date: string,
  goalId: string,
): AppState {
  const s = ensureDayEntry(state, date);
  const day = s.days[date];
  const current = day.monthlyGoalCompletions[goalId];
  // Toggle: if any positive value → 0, else → 1
  const newVal = (typeof current === "number" ? current > 0 : !!current)
    ? 0
    : 1;
  return {
    ...s,
    days: {
      ...s.days,
      [date]: {
        ...day,
        monthlyGoalCompletions: {
          ...day.monthlyGoalCompletions,
          [goalId]: newVal,
        },
      },
    },
  };
}

/** Set the count for a monthly goal on a specific day */
export function setMonthlyGoalCount(
  state: AppState,
  date: string,
  goalId: string,
  count: number,
): AppState {
  const s = ensureDayEntry(state, date);
  const day = s.days[date];
  return {
    ...s,
    days: {
      ...s.days,
      [date]: {
        ...day,
        monthlyGoalCompletions: {
          ...day.monthlyGoalCompletions,
          [goalId]: Math.max(0, count),
        },
      },
    },
  };
}

/** Get the count for a monthly goal on a specific day entry */
export function getMonthlyGoalDayCount(
  entry: { monthlyGoalCompletions: Record<string, number | boolean> },
  goalId: string,
): number {
  const val = entry.monthlyGoalCompletions[goalId];
  if (typeof val === "number") return val;
  if (val === true) return 1;
  return 0;
}

export function setReflection(
  state: AppState,
  date: string,
  text: string,
): AppState {
  const s = ensureDayEntry(state, date);
  return {
    ...s,
    days: {
      ...s.days,
      [date]: { ...s.days[date], reflection: text },
    },
  };
}

// ── Computed Values ──────────────────────────────────────────

export function getTodayEntry(state: AppState): DayEntry {
  const today = getDateString();
  return (
    state.days[today] || {
      basics: Object.fromEntries(state.enabledBasics.map((id) => [id, false])),
      completions: {},
      monthlyGoalCompletions: {},
      reflection: "",
    }
  );
}

/** Get completion stats for a specific date across both layers */
export function getDayStats(state: AppState, date: string) {
  const entry = state.days[date];
  if (!entry) {
    return {
      basicsTotal: state.enabledBasics.length,
      basicsDone: 0,
      dailyTotal: 0,
      dailyDone: 0,
      monthlyDone: 0,
      percent: 0,
    };
  }

  const basicsTotal = state.enabledBasics.length;
  const basicsDone = state.enabledBasics.filter(
    (id) => entry.basics[id] === true,
  ).length;

  // All enabled daily habits show every day (no frequency filtering)
  const todayHabits = state.dailyHabits.filter((h) => h.enabled);
  const dailyTotal = todayHabits.length;
  const dailyDone = todayHabits.filter((h) => entry.completions[h.id]).length;

  const monthlyDone = Object.values(entry.monthlyGoalCompletions).filter(
    Boolean,
  ).length;

  const totalItems = basicsTotal + dailyTotal;
  const totalDone = basicsDone + dailyDone;
  const percent =
    totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 100;

  return {
    basicsTotal,
    basicsDone,
    dailyTotal,
    dailyDone,
    monthlyDone,
    percent,
  };
}

/** Get total completions for a monthly goal across all days */
export function getMonthlyGoalProgress(
  state: AppState,
  goalId: string,
): number {
  let count = 0;
  for (const entry of Object.values(state.days)) {
    const val = entry.monthlyGoalCompletions[goalId];
    if (typeof val === "number") count += val;
    else if (val) count += 1;
  }
  return count;
}

/** Calculate current streak (consecutive days with any activity) */
export function calculateStreak(state: AppState): number {
  let streak = 0;
  let date = getDateString();
  while (true) {
    const stats = getDayStats(state, date);
    if (stats.percent < 50 && stats.dailyTotal > 0) break;
    if (!state.days[date] && date !== getDateString()) break;
    streak++;
    date = addDays(date, -1);
  }
  return streak;
}

/** Get longest streak */
export function getLongestStreak(state: AppState): number {
  const dates = Object.keys(state.days).sort();
  if (dates.length === 0) return 0;
  let longest = 0;
  let current = 0;
  let prevDate = "";
  for (const date of dates) {
    const stats = getDayStats(state, date);
    if (stats.percent >= 50) {
      if (prevDate && addDays(prevDate, 1) === date) {
        current++;
      } else {
        current = 1;
      }
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
    prevDate = date;
  }
  return longest;
}

/** Get total completed actions across all days */
export function getTotalCompleted(state: AppState): number {
  let total = 0;
  for (const entry of Object.values(state.days)) {
    total += Object.values(entry.completions).filter(Boolean).length;
    total += Object.values(entry.monthlyGoalCompletions || {}).filter(
      Boolean,
    ).length;
  }
  return total;
}

// ── Hex Grid Data ────────────────────────────────────────────

/** Generate 30 hex days for the grid */
export function getHexGridData(state: AppState): HexDay[] {
  const today = getDateString();
  const hexDays: HexDay[] = [];

  for (let i = 0; i < RAMADAN_DAYS; i++) {
    const date = addDays(state.ramadanStartDate, i);
    const stats = getDayStats(state, date);
    let status: HexDayStatus;

    if (date === today) {
      status = "today";
    } else if (date > today) {
      status = "future";
    } else if (!state.days[date]) {
      status = "past-empty";
    } else if (stats.percent >= 90) {
      status = "past-perfect";
    } else if (stats.percent >= 50) {
      status = "past-good";
    } else {
      status = "past-partial";
    }

    hexDays.push({
      day: i + 1,
      date,
      status,
      completionPercent: stats.percent,
    });
  }

  return hexDays;
}

/** Get current Ramadan day number (1 = first day, >30 = Ramadan over) */
export function getCurrentRamadanDay(state: AppState): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = state.ramadanStartDate.split("-").map(Number);
  const start = new Date(y, m - 1, d); // Local midnight of start date
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  // Don't clamp upper bound — values > 30 mean Ramadan is over (triggers Eid)
  return Math.max(1, diff + 1);
}

/** Get the Ramadan phase (mercy, forgiveness, freedom) */
export function getRamadanPhase(
  day: number,
): "mercy" | "forgiveness" | "freedom" {
  if (day <= 10) return "mercy";
  if (day <= 20) return "forgiveness";
  return "freedom";
}

/** Check if a day is in the Last 10 Nights (Laylatul Qadr period) */
export function isLastTenNights(day: number): boolean {
  return day >= 21 && day <= 30;
}

/** Check if a night is an odd night in the Last 10 (prime Laylatul Qadr candidates) */
export function isOddNight(day: number): boolean {
  return day >= 21 && day <= 30 && day % 2 === 1; // 21, 23, 25, 27, 29
}

// ── Export / Import ──────────────────────────────────────────

export function exportData(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export function importData(json: string): AppState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === "object" && parsed.version) {
      if (parsed.version < 3) return migrateToV4(migrateToV3(parsed));
      if (parsed.version < 4) return migrateToV4(parsed);
      return parsed as AppState;
    }
    return null;
  } catch {
    return null;
  }
}
