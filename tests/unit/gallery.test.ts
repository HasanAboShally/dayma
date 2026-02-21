// ============================================================
// Unit Tests — gallery.ts
// Date helpers, BASICS data, gallery integrity, conversion helpers
// ============================================================

import { describe, expect, test } from "bun:test";
import {
  ACTION_GALLERY,
  addDays,
  ALL_BASIC_IDS,
  BASICS,
  CATEGORIES,
  createCustomHabit,
  createCustomMonthlyGoal,
  findGalleryAction,
  findMonthlyGoalGallery,
  galleryToHabit,
  galleryToMonthlyGoal,
  getDateString,
  getNudgeMessage,
  getRamadanDay,
  MONTHLY_GOALS_GALLERY,
  STARTER_PACKS,
} from "@/lib/gallery";

// ── Date Helpers ─────────────────────────────────────────────

describe("getDateString", () => {
  test("formats a known date correctly", () => {
    const date = new Date(2025, 2, 1); // March 1, 2025
    expect(getDateString(date)).toBe("2025-03-01");
  });

  test("pads single-digit month and day", () => {
    const date = new Date(2025, 0, 5); // Jan 5
    expect(getDateString(date)).toBe("2025-01-05");
  });

  test("handles December 31", () => {
    const date = new Date(2025, 11, 31);
    expect(getDateString(date)).toBe("2025-12-31");
  });
});

describe("addDays", () => {
  test("adds positive days", () => {
    expect(addDays("2025-03-01", 5)).toBe("2025-03-06");
  });

  test("crosses month boundary", () => {
    expect(addDays("2025-03-29", 5)).toBe("2025-04-03");
  });

  test("adds zero days (identity)", () => {
    expect(addDays("2025-03-15", 0)).toBe("2025-03-15");
  });

  test("subtracts days with negative value", () => {
    expect(addDays("2025-03-10", -3)).toBe("2025-03-07");
  });
});

describe("getRamadanDay", () => {
  test("start date itself is day 1", () => {
    expect(getRamadanDay("2025-03-01", "2025-03-01")).toBe(1);
  });

  test("second day is day 2", () => {
    expect(getRamadanDay("2025-03-02", "2025-03-01")).toBe(2);
  });

  test("day 30", () => {
    expect(getRamadanDay("2025-03-30", "2025-03-01")).toBe(30);
  });

  test("before start returns 0 or negative", () => {
    expect(getRamadanDay("2025-02-28", "2025-03-01")).toBeLessThan(1);
  });
});

// ── BASICS ───────────────────────────────────────────────────

describe("BASICS", () => {
  test("has exactly 6 items (5 prayers + fasting)", () => {
    expect(BASICS).toHaveLength(6);
  });

  test("contains the 5 daily prayers", () => {
    const ids = BASICS.map((b) => b.id);
    expect(ids).toContain("fajr");
    expect(ids).toContain("dhuhr");
    expect(ids).toContain("asr");
    expect(ids).toContain("maghrib");
    expect(ids).toContain("isha");
  });

  test("contains fasting", () => {
    const ids = BASICS.map((b) => b.id);
    expect(ids).toContain("fasting");
  });

  test("each basic has required fields", () => {
    for (const b of BASICS) {
      expect(b.id).toBeTruthy();
      expect(b.titleKey).toBeTruthy();
      expect(b.titleAr).toBeTruthy();
      expect(b.iconName).toBeTruthy();
      expect(b.category).toBeTruthy();
    }
  });

  test("ALL_BASIC_IDS matches BASICS ids", () => {
    expect(ALL_BASIC_IDS).toEqual(BASICS.map((b) => b.id));
  });

  test("all IDs are unique", () => {
    const ids = BASICS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ── ACTION_GALLERY ───────────────────────────────────────────

describe("ACTION_GALLERY", () => {
  test("has at least 15 daily habits", () => {
    expect(ACTION_GALLERY.length).toBeGreaterThanOrEqual(15);
  });

  test("all IDs are unique", () => {
    const ids = ACTION_GALLERY.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("each action has required fields", () => {
    for (const a of ACTION_GALLERY) {
      expect(a.id).toBeTruthy();
      expect(a.titleKey).toBeTruthy();
      expect(a.titleAr).toBeTruthy();
      expect(a.descriptionKey).toBeTruthy();
      expect(a.descriptionAr).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.iconName).toBeTruthy();
      expect(Array.isArray(a.tags)).toBe(true);
      expect(a.tags.length).toBeGreaterThan(0);
    }
  });

  test("covers all main worship categories", () => {
    const cats = new Set(ACTION_GALLERY.map((a) => a.category));
    expect(cats.has("prayer")).toBe(true);
    expect(cats.has("quran")).toBe(true);
    expect(cats.has("dhikr")).toBe(true);
    expect(cats.has("charity")).toBe(true);
    expect(cats.has("dua")).toBe(true);
    expect(cats.has("fasting")).toBe(true);
    expect(cats.has("learning")).toBe(true);
  });
});

// ── MONTHLY_GOALS_GALLERY ────────────────────────────────────

describe("MONTHLY_GOALS_GALLERY", () => {
  test("has at least 5 monthly goals", () => {
    expect(MONTHLY_GOALS_GALLERY.length).toBeGreaterThanOrEqual(5);
  });

  test("all IDs are unique", () => {
    const ids = MONTHLY_GOALS_GALLERY.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("each goal has a positive default target", () => {
    for (const g of MONTHLY_GOALS_GALLERY) {
      expect(g.defaultTarget).toBeGreaterThan(0);
    }
  });
});

// ── CATEGORIES ───────────────────────────────────────────────

describe("CATEGORIES", () => {
  test("has 7 worship categories", () => {
    expect(CATEGORIES).toHaveLength(7);
  });

  test("includes prayer, quran, dhikr, charity, dua, fasting, learning", () => {
    const ids = CATEGORIES.map((c) => c.id);
    for (const expected of [
      "prayer",
      "quran",
      "dhikr",
      "charity",
      "dua",
      "fasting",
      "learning",
    ]) {
      expect(ids).toContain(expected);
    }
  });
});

// ── STARTER_PACKS ────────────────────────────────────────────

describe("STARTER_PACKS", () => {
  test("has 3 packs (beginner, balanced, devoted)", () => {
    expect(STARTER_PACKS).toHaveLength(3);
    const ids = STARTER_PACKS.map((p) => p.id);
    expect(ids).toContain("beginner");
    expect(ids).toContain("balanced");
    expect(ids).toContain("devoted");
  });

  test("each pack references only valid gallery action IDs", () => {
    const validIds = new Set(ACTION_GALLERY.map((a) => a.id));
    for (const pack of STARTER_PACKS) {
      for (const actionId of pack.actionIds) {
        expect(validIds.has(actionId)).toBe(true);
      }
    }
  });

  test("each pack references only valid monthly goal IDs", () => {
    const validIds = new Set(MONTHLY_GOALS_GALLERY.map((g) => g.id));
    for (const pack of STARTER_PACKS) {
      for (const goalId of pack.monthlyGoalIds) {
        expect(validIds.has(goalId)).toBe(true);
      }
    }
  });

  test("devoted pack has the most actions", () => {
    const beginner = STARTER_PACKS.find((p) => p.id === "beginner")!;
    const devoted = STARTER_PACKS.find((p) => p.id === "devoted")!;
    expect(devoted.actionIds.length).toBeGreaterThan(
      beginner.actionIds.length,
    );
  });
});

// ── Conversion Helpers ───────────────────────────────────────

describe("galleryToHabit", () => {
  test("converts a gallery action to a DailyHabit", () => {
    const action = ACTION_GALLERY[0];
    const habit = galleryToHabit(action);
    expect(habit.id).toBe(action.id);
    expect(habit.titleKey).toBe(action.titleKey);
    expect(habit.category).toBe(action.category);
    expect(habit.source).toBe("gallery");
    expect(habit.enabled).toBe(true);
    expect(habit.addedAt).toBeTruthy();
  });
});

describe("galleryToMonthlyGoal", () => {
  test("uses default target when none provided", () => {
    const item = MONTHLY_GOALS_GALLERY[0];
    const goal = galleryToMonthlyGoal(item);
    expect(goal.target).toBe(item.defaultTarget);
    expect(goal.source).toBe("gallery");
  });

  test("overrides target when provided", () => {
    const item = MONTHLY_GOALS_GALLERY[0];
    const goal = galleryToMonthlyGoal(item, 99);
    expect(goal.target).toBe(99);
  });
});

describe("createCustomHabit", () => {
  test("creates a habit with custom- prefix id", () => {
    const habit = createCustomHabit({
      title: "My Custom",
      description: "Desc",
      category: "dhikr",
    });
    expect(habit.id).toMatch(/^custom-/);
    expect(habit.source).toBe("custom");
    expect(habit.enabled).toBe(true);
  });
});

describe("createCustomMonthlyGoal", () => {
  test("creates a goal with custom-goal- prefix id", () => {
    const goal = createCustomMonthlyGoal({
      title: "My Goal",
      titleAr: "هدفي",
      description: "Desc",
      descriptionAr: "وصف",
      target: 10,
    });
    expect(goal.id).toMatch(/^custom-goal-/);
    expect(goal.source).toBe("custom");
    expect(goal.target).toBe(10);
  });
});

// ── Finder Helpers ───────────────────────────────────────────

describe("findGalleryAction", () => {
  test("finds an existing action", () => {
    const found = findGalleryAction("taraweeh");
    expect(found).toBeDefined();
    expect(found!.id).toBe("taraweeh");
  });

  test("returns undefined for missing id", () => {
    expect(findGalleryAction("nonexistent")).toBeUndefined();
  });
});

describe("findMonthlyGoalGallery", () => {
  test("finds an existing goal", () => {
    const found = findMonthlyGoalGallery("monthly-charity");
    expect(found).toBeDefined();
    expect(found!.id).toBe("monthly-charity");
  });

  test("returns undefined for missing id", () => {
    expect(findMonthlyGoalGallery("nope")).toBeUndefined();
  });
});

// ── Nudge Messages ───────────────────────────────────────────

describe("getNudgeMessage", () => {
  test("returns null for counts below 7", () => {
    expect(getNudgeMessage(0)).toBeNull();
    expect(getNudgeMessage(5)).toBeNull();
    expect(getNudgeMessage(6)).toBeNull();
  });

  test("returns soft nudge for 7-9", () => {
    expect(getNudgeMessage(7)).toBe("gallery.nudge_soft");
    expect(getNudgeMessage(9)).toBe("gallery.nudge_soft");
  });

  test("returns hard nudge for 10+", () => {
    expect(getNudgeMessage(10)).toBe("gallery.nudge_hard");
    expect(getNudgeMessage(20)).toBe("gallery.nudge_hard");
  });
});
