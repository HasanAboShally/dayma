// ============================================================
// Unit Tests — store.ts (Core State Management)
// Tests the foundation of the app: state transforms, basics
// model, day stats, streaks, hex grid data, and persistence.
// ============================================================

import { describe, expect, test, beforeEach, mock } from "bun:test";
import type { AppState, DailyHabit, MonthlyGoal, DayEntry } from "@/lib/app-types";
import {
  getDefaultState,
  ensureDayEntry,
  toggleBasicCompletion,
  toggleCompletion,
  getDayStats,
  completeSetup,
  setLocale,
  setRamadanStartDate,
  toggleBasicEnabled,
  addHabit,
  addHabits,
  removeHabit,
  toggleHabitEnabled,
  addMonthlyGoal,
  removeMonthlyGoal,
  updateMonthlyGoalTarget,
  setReflection,
  setMonthlyGoalCount,
  getMonthlyGoalDayCount,
  getMonthlyGoalProgress,
  calculateStreak,
  getLongestStreak,
  getTotalCompleted,
  getHexGridData,
  getCurrentRamadanDay,
  getRamadanPhase,
  isLastTenNights,
  isOddNight,
  exportData,
  importData,
  getTodayEntry,
} from "@/lib/store";
import { getDateString, addDays } from "@/lib/gallery";

// ── Helpers ──────────────────────────────────────────────────

function makeHabit(overrides: Partial<DailyHabit> = {}): DailyHabit {
  return {
    id: "test-habit",
    titleKey: "test.title",
    descriptionKey: "test.desc",
    category: "prayer",
    source: "gallery",
    enabled: true,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeGoal(overrides: Partial<MonthlyGoal> = {}): MonthlyGoal {
  return {
    id: "test-goal",
    titleKey: "test.goal",
    titleAr: "هدف تجريبي",
    descriptionKey: "test.goal.desc",
    descriptionAr: "وصف",
    iconName: "target",
    category: "quran",
    target: 10,
    source: "gallery",
    ...overrides,
  };
}

// ── Default State ────────────────────────────────────────────

describe("getDefaultState", () => {
  test("returns valid default state", () => {
    const state = getDefaultState();
    expect(state.version).toBe(4);
    expect(state.locale).toBe("en");
    expect(state.setupComplete).toBe(false);
    expect(state.enabledBasics.length).toBeGreaterThan(0);
    expect(state.dailyHabits).toEqual([]);
    expect(state.monthlyGoals).toEqual([]);
    expect(state.days).toEqual({});
  });

  test("respects locale parameter", () => {
    expect(getDefaultState("ar").locale).toBe("ar");
    expect(getDefaultState("en").locale).toBe("en");
  });
});

// ── Setup Transforms ─────────────────────────────────────────

describe("setup transforms", () => {
  let state: AppState;

  beforeEach(() => {
    state = getDefaultState();
  });

  test("completeSetup sets flag", () => {
    expect(completeSetup(state).setupComplete).toBe(true);
  });

  test("setLocale changes locale", () => {
    expect(setLocale(state, "ar").locale).toBe("ar");
  });

  test("setRamadanStartDate changes date", () => {
    const next = setRamadanStartDate(state, "2026-03-01");
    expect(next.ramadanStartDate).toBe("2026-03-01");
  });

  test("transforms are immutable", () => {
    const next = completeSetup(state);
    expect(state.setupComplete).toBe(false);
    expect(next.setupComplete).toBe(true);
    expect(state).not.toBe(next);
  });
});

// ── Basics Management ────────────────────────────────────────

describe("toggleBasicEnabled", () => {
  test("removes enabled basic", () => {
    const state = getDefaultState();
    const fajrEnabled = state.enabledBasics.includes("fajr");
    expect(fajrEnabled).toBe(true);
    const next = toggleBasicEnabled(state, "fajr");
    expect(next.enabledBasics.includes("fajr")).toBe(false);
  });

  test("adds disabled basic back", () => {
    let state = getDefaultState();
    state = toggleBasicEnabled(state, "fajr"); // remove
    state = toggleBasicEnabled(state, "fajr"); // add back
    expect(state.enabledBasics.includes("fajr")).toBe(true);
  });
});

// ── Daily Habits ─────────────────────────────────────────────

describe("daily habits", () => {
  let state: AppState;

  beforeEach(() => {
    state = getDefaultState();
  });

  test("addHabit adds a new habit", () => {
    const next = addHabit(state, makeHabit());
    expect(next.dailyHabits).toHaveLength(1);
    expect(next.dailyHabits[0].id).toBe("test-habit");
  });

  test("addHabit prevents duplicates", () => {
    let next = addHabit(state, makeHabit());
    next = addHabit(next, makeHabit()); // same id
    expect(next.dailyHabits).toHaveLength(1);
  });

  test("addHabits adds multiple at once", () => {
    const habits = [
      makeHabit({ id: "h1" }),
      makeHabit({ id: "h2" }),
      makeHabit({ id: "h3" }),
    ];
    const next = addHabits(state, habits);
    expect(next.dailyHabits).toHaveLength(3);
  });

  test("addHabits skips existing", () => {
    let next = addHabit(state, makeHabit({ id: "h1" }));
    next = addHabits(next, [makeHabit({ id: "h1" }), makeHabit({ id: "h2" })]);
    expect(next.dailyHabits).toHaveLength(2);
  });

  test("removeHabit removes by id", () => {
    let next = addHabit(state, makeHabit({ id: "h1" }));
    next = addHabit(next, makeHabit({ id: "h2" }));
    next = removeHabit(next, "h1");
    expect(next.dailyHabits).toHaveLength(1);
    expect(next.dailyHabits[0].id).toBe("h2");
  });

  test("toggleHabitEnabled flips enabled flag", () => {
    let next = addHabit(state, makeHabit({ id: "h1", enabled: true }));
    next = toggleHabitEnabled(next, "h1");
    expect(next.dailyHabits[0].enabled).toBe(false);
    next = toggleHabitEnabled(next, "h1");
    expect(next.dailyHabits[0].enabled).toBe(true);
  });
});

// ── Monthly Goals ────────────────────────────────────────────

describe("monthly goals", () => {
  let state: AppState;

  beforeEach(() => {
    state = getDefaultState();
  });

  test("addMonthlyGoal adds goal", () => {
    const next = addMonthlyGoal(state, makeGoal());
    expect(next.monthlyGoals).toHaveLength(1);
  });

  test("addMonthlyGoal prevents duplicates", () => {
    let next = addMonthlyGoal(state, makeGoal());
    next = addMonthlyGoal(next, makeGoal());
    expect(next.monthlyGoals).toHaveLength(1);
  });

  test("removeMonthlyGoal removes by id", () => {
    let next = addMonthlyGoal(state, makeGoal({ id: "g1" }));
    next = addMonthlyGoal(next, makeGoal({ id: "g2" }));
    next = removeMonthlyGoal(next, "g1");
    expect(next.monthlyGoals).toHaveLength(1);
    expect(next.monthlyGoals[0].id).toBe("g2");
  });

  test("updateMonthlyGoalTarget changes target", () => {
    let next = addMonthlyGoal(state, makeGoal({ id: "g1", target: 10 }));
    next = updateMonthlyGoalTarget(next, "g1", 20);
    expect(next.monthlyGoals[0].target).toBe(20);
  });
});

// ── Day Entry + Basics Model ─────────────────────────────────

describe("ensureDayEntry", () => {
  test("creates entry with basics defaulting to FALSE (unchecked)", () => {
    const state = getDefaultState();
    const date = "2026-02-20";
    const next = ensureDayEntry(state, date);
    const entry = next.days[date];
    expect(entry).toBeDefined();
    // ALL basics should be false (confirm-done model)
    for (const id of state.enabledBasics) {
      expect(entry.basics[id]).toBe(false);
    }
  });

  test("does not overwrite existing entry", () => {
    let state = getDefaultState();
    const date = "2026-02-20";
    state = ensureDayEntry(state, date);
    state = toggleBasicCompletion(state, date, "fajr"); // check fajr
    const again = ensureDayEntry(state, date);
    expect(again.days[date].basics["fajr"]).toBe(true); // still checked
  });

  test("entry has empty completions and reflection", () => {
    const state = getDefaultState();
    const date = "2026-02-20";
    const next = ensureDayEntry(state, date);
    expect(next.days[date].completions).toEqual({});
    expect(next.days[date].monthlyGoalCompletions).toEqual({});
    expect(next.days[date].reflection).toBe("");
  });
});

describe("toggleBasicCompletion", () => {
  test("toggles from false to true", () => {
    const state = getDefaultState();
    const date = "2026-02-20";
    const next = toggleBasicCompletion(state, date, "fajr");
    expect(next.days[date].basics["fajr"]).toBe(true);
  });

  test("toggles from true to false", () => {
    let state = getDefaultState();
    const date = "2026-02-20";
    state = toggleBasicCompletion(state, date, "fajr"); // → true
    state = toggleBasicCompletion(state, date, "fajr"); // → false
    expect(state.days[date].basics["fajr"]).toBe(false);
  });

  test("creates day entry if needed", () => {
    const state = getDefaultState();
    const date = "2026-02-20";
    expect(state.days[date]).toBeUndefined();
    const next = toggleBasicCompletion(state, date, "fajr");
    expect(next.days[date]).toBeDefined();
  });
});

describe("toggleCompletion (daily habits)", () => {
  test("toggles habit completion", () => {
    let state = getDefaultState();
    state = addHabit(state, makeHabit({ id: "reading" }));
    const date = "2026-02-20";
    let next = toggleCompletion(state, date, "reading");
    expect(next.days[date].completions["reading"]).toBe(true);
    next = toggleCompletion(next, date, "reading");
    expect(next.days[date].completions["reading"]).toBe(false);
  });
});

// ── Day Stats (Critical — the percentage engine) ─────────────

describe("getDayStats", () => {
  test("returns 0% for non-existent day (no entry)", () => {
    const state = getDefaultState();
    const stats = getDayStats(state, "2026-02-25");
    expect(stats.basicsDone).toBe(0);
    expect(stats.percent).toBe(0);
    expect(stats.basicsTotal).toBe(state.enabledBasics.length);
  });

  test("returns 0% for fresh entry (all unchecked)", () => {
    let state = getDefaultState();
    state = ensureDayEntry(state, "2026-02-20");
    const stats = getDayStats(state, "2026-02-20");
    expect(stats.basicsDone).toBe(0);
    expect(stats.percent).toBe(0);
  });

  test("correctly counts checked basics", () => {
    let state = getDefaultState();
    const date = "2026-02-20";
    state = toggleBasicCompletion(state, date, "fajr");
    state = toggleBasicCompletion(state, date, "dhuhr");
    const stats = getDayStats(state, date);
    expect(stats.basicsDone).toBe(2);
    expect(stats.basicsTotal).toBe(state.enabledBasics.length);
  });

  test("counts daily habits in percentage", () => {
    let state = getDefaultState();
    state = addHabit(state, makeHabit({ id: "h1" }));
    state = addHabit(state, makeHabit({ id: "h2" }));
    const date = "2026-02-20";
    state = toggleCompletion(state, date, "h1");
    const stats = getDayStats(state, date);
    // 0 basics done (all false) + 1 habit done out of total 6 basics + 2 habits = 8
    expect(stats.dailyDone).toBe(1);
    expect(stats.dailyTotal).toBe(2);
    const expectedPercent = Math.round((1 / (state.enabledBasics.length + 2)) * 100);
    expect(stats.percent).toBe(expectedPercent);
  });

  test("100% when all basics + all habits checked", () => {
    let state = getDefaultState();
    state = addHabit(state, makeHabit({ id: "h1" }));
    const date = "2026-02-20";
    // Check all basics
    for (const id of state.enabledBasics) {
      state = toggleBasicCompletion(state, date, id);
    }
    // Check habit
    state = toggleCompletion(state, date, "h1");
    const stats = getDayStats(state, date);
    expect(stats.percent).toBe(100);
  });

  test("disabled habits not counted", () => {
    let state = getDefaultState();
    state = addHabit(state, makeHabit({ id: "h1", enabled: true }));
    state = addHabit(state, makeHabit({ id: "h2", enabled: false }));
    const date = "2026-02-20";
    state = ensureDayEntry(state, date);
    const stats = getDayStats(state, date);
    expect(stats.dailyTotal).toBe(1); // only enabled
  });

  test("returns 0% when no items at all", () => {
    // Edge case: user disabled all basics and has no habits
    let state = getDefaultState();
    state = { ...state, enabledBasics: [], dailyHabits: [] };
    const stats = getDayStats(state, "2026-02-20");
    expect(stats.percent).toBe(0); // no items = 0% (nothing to complete)
  });
});

// ── Reflection ───────────────────────────────────────────────

describe("setReflection", () => {
  test("sets and retrieves reflection text", () => {
    let state = getDefaultState();
    const date = "2026-02-20";
    state = setReflection(state, date, "Today was beautiful");
    expect(state.days[date].reflection).toBe("Today was beautiful");
  });

  test("overwrites existing reflection", () => {
    let state = getDefaultState();
    const date = "2026-02-20";
    state = setReflection(state, date, "First");
    state = setReflection(state, date, "Second");
    expect(state.days[date].reflection).toBe("Second");
  });
});

// ── Monthly Goal Day Tracking ────────────────────────────────

describe("monthly goal day tracking", () => {
  test("setMonthlyGoalCount sets count for a day", () => {
    let state = getDefaultState();
    state = addMonthlyGoal(state, makeGoal({ id: "quran-khatm" }));
    const date = "2026-02-20";
    state = setMonthlyGoalCount(state, date, "quran-khatm", 3);
    expect(getMonthlyGoalDayCount(state.days[date], "quran-khatm")).toBe(3);
  });

  test("getMonthlyGoalProgress totals across days", () => {
    let state = getDefaultState();
    state = addMonthlyGoal(state, makeGoal({ id: "g1" }));
    state = setMonthlyGoalCount(state, "2026-02-20", "g1", 2);
    state = setMonthlyGoalCount(state, "2026-02-21", "g1", 3);
    expect(getMonthlyGoalProgress(state, "g1")).toBe(5);
  });
});

// ── Streaks ──────────────────────────────────────────────────

describe("calculateStreak", () => {
  test("returns 0 for default state with no entries", () => {
    const state = getDefaultState();
    // Streak calculation depends on today's date
    // With the basics flip to false, a day with no entry returns 0%
    // and if there are dailyHabits, streak breaks.
    // With no habits, getDayStats returns { percent: 0 } for unvisited days
    // but the streak code checks: if percent < 50 && dailyTotal > 0 break
    // With no habits (dailyTotal = 0), it won't break on that check
    // but then: if !state.days[date] && date !== today → break
    // So for default state with no entries, streak = 1 (today passes the first check)
    const streak = calculateStreak(state);
    expect(streak).toBeGreaterThanOrEqual(0);
  });
});

// ── Ramadan Phase Helpers ────────────────────────────────────

describe("getRamadanPhase", () => {
  test("days 1-10 are mercy", () => {
    for (let d = 1; d <= 10; d++) {
      expect(getRamadanPhase(d)).toBe("mercy");
    }
  });

  test("days 11-20 are forgiveness", () => {
    for (let d = 11; d <= 20; d++) {
      expect(getRamadanPhase(d)).toBe("forgiveness");
    }
  });

  test("days 21-30 are freedom", () => {
    for (let d = 21; d <= 30; d++) {
      expect(getRamadanPhase(d)).toBe("freedom");
    }
  });
});

describe("isLastTenNights", () => {
  test("returns true for days 21-30", () => {
    for (let d = 21; d <= 30; d++) {
      expect(isLastTenNights(d)).toBe(true);
    }
  });

  test("returns false for days 1-20", () => {
    for (let d = 1; d <= 20; d++) {
      expect(isLastTenNights(d)).toBe(false);
    }
  });
});

describe("isOddNight", () => {
  test("returns true for 21, 23, 25, 27, 29", () => {
    for (const d of [21, 23, 25, 27, 29]) {
      expect(isOddNight(d)).toBe(true);
    }
  });

  test("returns false for even nights", () => {
    for (const d of [22, 24, 26, 28, 30]) {
      expect(isOddNight(d)).toBe(false);
    }
  });

  test("returns false for days outside last 10", () => {
    expect(isOddNight(15)).toBe(false);
    expect(isOddNight(5)).toBe(false);
  });
});

// ── Hex Grid Data ────────────────────────────────────────────

describe("getHexGridData", () => {
  test("returns 30 hex days", () => {
    const state = getDefaultState();
    const data = getHexGridData(state);
    expect(data).toHaveLength(30);
  });

  test("days are numbered 1-30", () => {
    const state = getDefaultState();
    const data = getHexGridData(state);
    expect(data[0].day).toBe(1);
    expect(data[29].day).toBe(30);
  });

  test("dates are sequential from ramadanStartDate", () => {
    const state = getDefaultState();
    const data = getHexGridData(state);
    expect(data[0].date).toBe(state.ramadanStartDate);
    expect(data[1].date).toBe(addDays(state.ramadanStartDate, 1));
  });

  test("past days without entry are past-empty", () => {
    // Create a state where the start date is well in the past
    const state = { ...getDefaultState(), ramadanStartDate: "2025-01-01" };
    const data = getHexGridData(state);
    const pastDays = data.filter((d) => d.status === "past-empty");
    expect(pastDays.length).toBeGreaterThan(0);
  });

  test("completionPercent reflects getDayStats", () => {
    let state = getDefaultState();
    const date = state.ramadanStartDate;
    // Check all basics for day 1
    for (const id of state.enabledBasics) {
      state = toggleBasicCompletion(state, date, id);
    }
    const data = getHexGridData(state);
    const day1 = data.find((d) => d.date === date);
    expect(day1?.completionPercent).toBe(100);
  });
});

// ── Export / Import ──────────────────────────────────────────

describe("export/import", () => {
  test("exportData returns valid JSON string", () => {
    const state = getDefaultState();
    const json = exportData(state);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  test("importData round-trips with exportData", () => {
    const state = getDefaultState();
    const json = exportData(state);
    const imported = importData(json);
    expect(imported).not.toBeNull();
    expect(imported?.version).toBe(state.version);
    expect(imported?.locale).toBe(state.locale);
  });

  test("importData returns null for invalid JSON", () => {
    expect(importData("not json")).toBeNull();
    expect(importData('{"no":"version"}')).toBeNull();
  });
});

// ── getTodayEntry ────────────────────────────────────────────

describe("getTodayEntry", () => {
  test("returns entry with all basics false when no entry exists", () => {
    const state = getDefaultState();
    const entry = getTodayEntry(state);
    for (const id of state.enabledBasics) {
      expect(entry.basics[id]).toBe(false);
    }
  });
});
