/**
 * Web Vitals tracking for Core Web Vitals metrics
 * Tracks: LCP, CLS, TTFB, INP
 * Sends metrics to configured analytics providers
 */

import type { Metric } from "web-vitals";
import { onCLS, onINP, onLCP, onTTFB } from "web-vitals";

type AnalyticsCallback = (metric: Metric) => void;

/**
 * Default analytics sender - logs to console in dev, sends to GA4/analytics in prod
 */
const defaultCallback: AnalyticsCallback = (metric) => {
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vital] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
    return;
  }

  // Send to Google Analytics 4
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as unknown as { gtag: (...args: unknown[]) => void }).gtag;
    gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  // Send to Mixpanel
  if (typeof window !== "undefined" && "mixpanel" in window) {
    const mixpanel = (
      window as unknown as {
        mixpanel: { track: (name: string, props: object) => void };
      }
    ).mixpanel;
    mixpanel.track("Web Vital", {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }

  // Send to custom endpoint (optional)
  const analyticsEndpoint = import.meta.env.PUBLIC_VITALS_ENDPOINT;
  if (analyticsEndpoint) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType:
        metric.navigationType ||
        (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming)?.type,
      url: window.location.href,
      timestamp: Date.now(),
    });

    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      navigator.sendBeacon(analyticsEndpoint, body);
    } else {
      fetch(analyticsEndpoint, {
        body,
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};

/**
 * Initialize Web Vitals tracking
 * Call this once in your app, typically in BaseLayout
 */
export function initWebVitals(callback?: AnalyticsCallback): void {
  const handler = callback || defaultCallback;

  // Core Web Vitals (2024+)
  onLCP(handler); // Largest Contentful Paint
  onCLS(handler); // Cumulative Layout Shift
  onINP(handler); // Interaction to Next Paint

  // Other useful metrics
  onTTFB(handler); // Time to First Byte
}

/**
 * Get Web Vitals thresholds for rating
 */
export const vitalsThresholds = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

/**
 * Check if a metric value is considered "good"
 */
export function isGoodVital(name: keyof typeof vitalsThresholds, value: number): boolean {
  return value <= vitalsThresholds[name].good;
}

/**
 * Get rating for a metric value
 */
export function getVitalRating(
  name: keyof typeof vitalsThresholds,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = vitalsThresholds[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
}
