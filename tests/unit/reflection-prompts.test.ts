// ============================================================
// Unit Tests — reflection-prompts.ts
// Validates all 30 prompts exist and the getter works correctly
// ============================================================

import { describe, expect, test } from "bun:test";
import { getReflectionPrompt } from "@/lib/reflection-prompts";

describe("getReflectionPrompt", () => {
  test("returns English prompts for all 30 days", () => {
    for (let day = 1; day <= 30; day++) {
      const prompt = getReflectionPrompt(day, "en");
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(10);
    }
  });

  test("returns Arabic prompts for all 30 days", () => {
    for (let day = 1; day <= 30; day++) {
      const prompt = getReflectionPrompt(day, "ar");
      expect(typeof prompt).toBe("string");
      expect(prompt.length).toBeGreaterThan(5);
    }
  });

  test("English and Arabic prompts are different", () => {
    for (let day = 1; day <= 30; day++) {
      const en = getReflectionPrompt(day, "en");
      const ar = getReflectionPrompt(day, "ar");
      expect(en).not.toBe(ar);
    }
  });

  test("all 30 English prompts are unique", () => {
    const prompts = new Set<string>();
    for (let day = 1; day <= 30; day++) {
      prompts.add(getReflectionPrompt(day, "en"));
    }
    expect(prompts.size).toBe(30);
  });

  test("clamps day < 1 to first prompt", () => {
    expect(getReflectionPrompt(0, "en")).toBe(getReflectionPrompt(1, "en"));
    expect(getReflectionPrompt(-5, "en")).toBe(getReflectionPrompt(1, "en"));
  });

  test("clamps day > 30 to last prompt", () => {
    expect(getReflectionPrompt(31, "en")).toBe(getReflectionPrompt(30, "en"));
    expect(getReflectionPrompt(100, "en")).toBe(getReflectionPrompt(30, "en"));
  });

  test("day 15 prompt mentions halfway (English)", () => {
    const prompt = getReflectionPrompt(15, "en");
    expect(prompt.toLowerCase()).toContain("halfway");
  });

  test("day 21 prompt relates to last 10 nights (English)", () => {
    const prompt = getReflectionPrompt(21, "en");
    expect(prompt.toLowerCase()).toContain("last 10");
  });

  test("day 30 prompt is a closing reflection (English)", () => {
    const prompt = getReflectionPrompt(30, "en");
    expect(prompt.toLowerCase()).toContain("end");
  });
});
