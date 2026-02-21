// ============================================================
// Ramadan Companion — Onboarding Tour
// A simple spotlight-based walkthrough for first-time users.
// Shows 3 steps highlighting the journey grid, log button,
// and menu. Stores completion in localStorage.
// ============================================================

import { createTranslator } from "@/i18n/client";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import type { AppLocale } from "@/lib/app-types";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface OnboardingTourProps {
  locale: AppLocale;
}

const TOUR_KEY = "dayma_onboarding_done";
const TOTAL_STEPS = 3;

interface TourStep {
  titleKey: string;
  descKey: string;
  position: "top" | "center" | "bottom";
  emoji: string;
}

const STEPS: TourStep[] = [
  {
    titleKey: "onboarding.welcome",
    descKey: "onboarding.step1",
    position: "center",
    emoji: "🌙",
  },
  {
    titleKey: "onboarding.welcome",
    descKey: "onboarding.step2",
    position: "bottom",
    emoji: "✨",
  },
  {
    titleKey: "onboarding.welcome",
    descKey: "onboarding.step3",
    position: "top",
    emoji: "📱",
  },
];

export function OnboardingTour({ locale }: OnboardingTourProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if not previously completed
    if (typeof localStorage === "undefined") return;
    if (localStorage.getItem(TOUR_KEY)) return;

    // Small delay so the main UI renders first
    const timer = setTimeout(() => {
      setVisible(true);
      trackEvent(AnalyticsEvents.ONBOARDING_STARTED);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS - 1) {
      setStep((s) => s + 1);
    } else {
      // Complete
      setVisible(false);
      localStorage.setItem(TOUR_KEY, "1");
      trackEvent(AnalyticsEvents.ONBOARDING_COMPLETED, {
        steps_viewed: TOTAL_STEPS,
      });
    }
  }, [step]);

  const handleSkip = useCallback(() => {
    setVisible(false);
    localStorage.setItem(TOUR_KEY, "1");
    trackEvent(AnalyticsEvents.ONBOARDING_SKIPPED, {
      skipped_at_step: step + 1,
    });
  }, [step]);

  if (!visible) return null;

  const currentStep = STEPS[step];

  const positionClasses = {
    top: "items-start pt-24",
    center: "items-center",
    bottom: "items-end pb-36",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[80] flex justify-center bg-black/60 backdrop-blur-sm ${positionClasses[currentStep.position]}`}
        onClick={handleNext}
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="mx-6 max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl dark:bg-secondary-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-3 text-4xl">{currentStep.emoji}</div>

          <h2
            className="mb-2 text-xl font-black text-secondary-900 dark:text-white"
            style={{
              fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-heading)",
            }}
          >
            {t(currentStep.titleKey)}
          </h2>

          <p className="mb-6 text-sm font-medium leading-relaxed text-secondary-600 dark:text-secondary-400">
            {t(currentStep.descKey)}
          </p>

          {/* Progress dots */}
          <div className="mb-5 flex items-center justify-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={`dot-${i}`}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-6 bg-primary-500"
                    : i < step
                      ? "w-2 bg-primary-300"
                      : "w-2 bg-secondary-300 dark:bg-secondary-600"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-secondary-500 transition-colors hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-700"
            >
              {t("onboarding.skip")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-emerald-500 px-4 py-3 text-sm font-black text-white shadow-md transition-all hover:shadow-lg active:scale-95"
              style={{
                fontFamily: isRTL
                  ? "var(--font-arabic)"
                  : "var(--font-heading)",
              }}
            >
              {step < TOTAL_STEPS - 1
                ? t("onboarding.next")
                : t("onboarding.done")}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
