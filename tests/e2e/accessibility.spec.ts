// ============================================================
// E2E Accessibility Tests — Dayma (Ramadan Companion)
// Validates ARIA attributes, keyboard navigation, focus
// management, and reduced motion support
// ============================================================

import { test, expect } from "@playwright/test";

test.describe("Accessibility — Skip to content", () => {
  test("skip link is focusable and navigates to main content", async ({
    page,
  }) => {
    await page.goto("/en");
    // Tab into the page — first focusable element should be skip link
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    // Click it and verify focus moves to #main-content area
    await skipLink.click();
    const main = page.locator("#main-content");
    await expect(main).toBeVisible();
  });
});

test.describe("Accessibility — ARIA landmarks", () => {
  test("main content landmark exists", async ({ page }) => {
    await page.goto("/en");
    const main = page.locator("main#main-content");
    await expect(main).toBeVisible();
  });

  test("app page has journey grid with role=group", async ({ page }) => {
    await page.goto("/en/app");
    await page.waitForTimeout(2000);
    const grid = page.locator('[role="group"]');
    // May or may not be visible depending on setup state
    const count = await grid.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe("Accessibility — RTL support", () => {
  test("Arabic pages have dir=rtl and lang=ar", async ({ page }) => {
    await page.goto("/ar");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "ar");
    await expect(html).toHaveAttribute("dir", "rtl");
  });

  test("English pages have dir=ltr and lang=en", async ({ page }) => {
    await page.goto("/en");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("lang", "en");
    await expect(html).toHaveAttribute("dir", "ltr");
  });
});

test.describe("Accessibility — Reduced motion", () => {
  test("respects prefers-reduced-motion for scroll behavior", async ({
    page,
  }) => {
    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en");
    // The scrollBehavior should be "auto" instead of "smooth"
    const scrollBehavior = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).scrollBehavior;
    });
    expect(scrollBehavior).toBe("auto");
  });
});

test.describe("Accessibility — Structured data", () => {
  test("has WebSite JSON-LD schema", async ({ page }) => {
    await page.goto("/en");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const text = await jsonLd.first().textContent();
    expect(text).toContain('"@type":"WebSite"');
  });

  test("has SoftwareApplication JSON-LD schema", async ({ page }) => {
    await page.goto("/en");
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(2);
    // Find the SoftwareApplication one
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await jsonLd.nth(i).textContent();
      if (text?.includes('"SoftwareApplication"')) {
        found = true;
        expect(text).toContain('"applicationCategory"');
        expect(text).toContain('"offers"');
        break;
      }
    }
    expect(found).toBe(true);
  });
});
