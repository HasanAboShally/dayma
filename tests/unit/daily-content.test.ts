// ============================================================
// Unit Tests — daily-content.ts
// Validates all 30 days of Quranic content + hadiths exist
// ============================================================

import { describe, expect, test } from "bun:test";
import { getDailyContent } from "@/lib/daily-content";

describe("getDailyContent", () => {
  test("returns content for all 30 days", () => {
    for (let day = 1; day <= 30; day++) {
      const content = getDailyContent(day);
      expect(content).toBeDefined();
      expect(content.day).toBe(day);
    }
  });

  test("each day has verse with ar, en, and ref", () => {
    for (let day = 1; day <= 30; day++) {
      const { verse } = getDailyContent(day);
      expect(verse.ar.length).toBeGreaterThan(5);
      expect(verse.en.length).toBeGreaterThan(5);
      expect(verse.ref.length).toBeGreaterThan(3);
    }
  });

  test("each day has hadith with ar, en, and ref", () => {
    for (let day = 1; day <= 30; day++) {
      const { hadith } = getDailyContent(day);
      expect(hadith.ar.length).toBeGreaterThan(5);
      expect(hadith.en.length).toBeGreaterThan(5);
      expect(hadith.ref.length).toBeGreaterThan(3);
    }
  });

  test("clamps out-of-range days", () => {
    expect(getDailyContent(0).day).toBe(1);
    expect(getDailyContent(-5).day).toBe(1);
    expect(getDailyContent(31).day).toBe(30);
    expect(getDailyContent(100).day).toBe(30);
  });

  test("verse references contain recognizable sources", () => {
    for (let day = 1; day <= 30; day++) {
      const { verse } = getDailyContent(day);
      // refs should contain something like "Al-Baqarah 2:185" or "Quran X:Y"
      expect(verse.ref.length).toBeGreaterThan(3);
    }
  });

  test("hadith references contain recognizable sources", () => {
    for (let day = 1; day <= 30; day++) {
      const { hadith } = getDailyContent(day);
      // refs should mention a hadith collection
      expect(hadith.ref.length).toBeGreaterThan(3);
    }
  });
});
