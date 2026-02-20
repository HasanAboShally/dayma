// ============================================================
// Ramadan Companion — Setup Wizard (4-step)
// Step 1: Date picker  →  Step 2: Daily habits  →
// Step 3: Monthly goals  →  Step 4: Summary + بسم الله
// ============================================================

import { useTranslations } from "@/i18n/utils";
import type { AppState, WorshipCategory } from "@/lib/app-types";
import {
  ACTION_GALLERY,
  CATEGORIES,
  MONTHLY_GOALS_GALLERY,
  createCustomHabit,
  createCustomMonthlyGoal,
  galleryToHabit,
  galleryToMonthlyGoal,
} from "@/lib/gallery";
import { Icon, type IconName } from "@/lib/icons";
import {
  addHabit,
  addMonthlyGoal,
  completeSetup,
  loadState,
  removeHabit,
  removeMonthlyGoal,
  saveState,
  setRamadanStartDate,
  updateMonthlyGoalTarget,
} from "@/lib/store";
import { navigateTo } from "@/utils/navigate";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";

// ── Category icon map ────────────────────────────────────────

const CATEGORY_ICONS: Record<string, IconName> = {
  prayer: "moon-star",
  quran: "book-open",
  dhikr: "sparkles",
  charity: "heart-handshake",
  dua: "hand",
  fasting: "utensils-crossed",
  learning: "graduation-cap",
};

// ── Step type ────────────────────────────────────────────────

type WizardStep = "date" | "daily" | "monthly" | "summary";
const STEPS: WizardStep[] = ["date", "daily", "monthly", "summary"];

// ── Props ────────────────────────────────────────────────────

interface SetupProps {
  locale: string;
  initialState?: AppState;
}

// ══════════════════════════════════════════════════════════════
// Main Setup Wizard
// ══════════════════════════════════════════════════════════════

export function Setup({ locale, initialState }: SetupProps) {
  const t = useTranslations(locale as "en" | "ar");
  const isAr = locale === "ar";

  const [state, setState] = useState<AppState>(
    () => initialState ?? loadState(),
  );
  const [step, setStep] = useState<WizardStep>("date");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [showCustomGoalForm, setShowCustomGoalForm] = useState(false);
  const [showLightBurst, setShowLightBurst] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  // ── Derived state ──────────────────────────────────────────

  const selectedIds = useMemo(
    () => new Set(state.dailyHabits.map((h) => h.id)),
    [state.dailyHabits],
  );

  // ── Navigation ─────────────────────────────────────────────

  const goNext = useCallback(() => {
    const i = STEPS.indexOf(step);
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]);
  }, [step]);

  const goBack = useCallback(() => {
    const i = STEPS.indexOf(step);
    if (i > 0) setStep(STEPS[i - 1]);
  }, [step]);

  // ── Handlers ───────────────────────────────────────────────

  const handleDateSelect = useCallback((date: string) => {
    setState((prev) => {
      const next = setRamadanStartDate(prev, date);
      saveState(next);
      return next;
    });
  }, []);

  const handleGalleryToggle = useCallback(
    (ga: (typeof ACTION_GALLERY)[number]) => {
      setState((prev) => {
        const exists = prev.dailyHabits.some((h) => h.id === ga.id);
        const next = exists
          ? removeHabit(prev, ga.id)
          : addHabit(prev, galleryToHabit(ga));
        saveState(next);
        return next;
      });
    },
    [],
  );

  const handleGoalTargetChange = useCallback(
    (goalId: string, newTarget: number) => {
      if (newTarget < 1) return;
      setState((prev) => {
        const next = updateMonthlyGoalTarget(prev, goalId, newTarget);
        saveState(next);
        return next;
      });
    },
    [],
  );

  /** Increment goal: add if not present (start at 1), otherwise +1 */
  const handleGoalIncrement = useCallback(
    (goalItem: (typeof MONTHLY_GOALS_GALLERY)[number]) => {
      setState((prev) => {
        const exists = prev.monthlyGoals.find((g) => g.id === goalItem.id);
        if (!exists) {
          // Start at 1 (not defaultTarget) so the first tap = 1
          const next = addMonthlyGoal(prev, galleryToMonthlyGoal(goalItem, 1));
          saveState(next);
          return next;
        }
        const next = updateMonthlyGoalTarget(
          prev,
          goalItem.id,
          exists.target + 1,
        );
        saveState(next);
        return next;
      });
    },
    [],
  );

  /** Decrement goal: if target = 1, remove; otherwise -1 */
  const handleGoalDecrement = useCallback(
    (goalItem: (typeof MONTHLY_GOALS_GALLERY)[number]) => {
      setState((prev) => {
        const existing = prev.monthlyGoals.find((g) => g.id === goalItem.id);
        if (!existing) return prev;
        if (existing.target <= 1) {
          const next = removeMonthlyGoal(prev, goalItem.id);
          saveState(next);
          return next;
        }
        const next = updateMonthlyGoalTarget(
          prev,
          goalItem.id,
          existing.target - 1,
        );
        saveState(next);
        return next;
      });
    },
    [],
  );

  const handleAddCustom = useCallback(
    (fields: {
      title: string;
      description: string;
      category: WorshipCategory;
      target?: number;
      unit?: string;
    }) => {
      const habit = createCustomHabit(fields);
      setState((prev) => {
        const next = addHabit(prev, habit);
        saveState(next);
        return next;
      });
      setShowCustomForm(false);
    },
    [],
  );

  const handleAddCustomGoal = useCallback(
    (fields: {
      title: string;
      description: string;
      target: number;
      category: WorshipCategory;
    }) => {
      const goal = createCustomMonthlyGoal({
        ...fields,
        titleAr: fields.title,
        descriptionAr: fields.description,
      });
      setState((prev) => {
        const next = addMonthlyGoal(prev, goal);
        saveState(next);
        return next;
      });
      setShowCustomGoalForm(false);
    },
    [],
  );

  const handleComplete = useCallback(() => {
    setState((prev) => {
      const next = completeSetup(prev);
      saveState(next);
      return next;
    });
    // Trigger light burst animation, then navigate
    setShowLightBurst(true);
    setTimeout(() => {
      navigateTo(`/${locale}/app/today`);
    }, 1400);
  }, [locale]);

  // ── Step indicator labels ──────────────────────────────────

  const stepLabels = [
    t("setup.step_date"),
    t("setup.step_daily"),
    t("setup.step_monthly"),
    t("setup.step_summary"),
  ];

  // ══════════════════════════════════════════════════════════════
  // Render
  // ══════════════════════════════════════════════════════════════

  return (
    <div
      data-hydrated="true"
      className="mx-auto min-h-screen max-w-lg px-4 pb-28 pt-20"
    >
      {/* ── Step Indicator ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`h-1.5 w-full rounded-full transition-all duration-300 ${
                  i <= stepIndex
                    ? "bg-primary-500"
                    : "bg-secondary-200 dark:bg-secondary-700"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  i === stepIndex
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-secondary-400 dark:text-secondary-500"
                }`}
              >
                {stepLabels[i]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 1: Date                                           */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "date" && (
          <motion.section
            key="date"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-100 dark:bg-accent-900/30">
              <Icon name="calendar" className="h-8 w-8 text-accent-500" />
            </div>
            <h1 className="mt-3 font-heading text-xl font-bold text-secondary-900 dark:text-white">
              {t("setup.date_title")}
            </h1>
            <p className="mt-1 text-center text-sm text-secondary-500 dark:text-secondary-400">
              {t("setup.date_desc")}
            </p>

            <div className="mt-8 grid w-full grid-cols-2 gap-3">
              {[
                { date: "2026-02-18", labelKey: "setup.date_feb18" },
                { date: "2026-02-19", labelKey: "setup.date_feb19" },
              ].map((opt) => {
                const selected = state.ramadanStartDate === opt.date;
                return (
                  <motion.button
                    key={opt.date}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleDateSelect(opt.date)}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-5 transition-all ${
                      selected
                        ? "border-accent-400 bg-accent-50 shadow-md shadow-accent-200/40 dark:border-accent-600 dark:bg-accent-950/20 dark:shadow-accent-900/20"
                        : "border-secondary-200 bg-white hover:border-accent-200 dark:border-secondary-700 dark:bg-secondary-800/60"
                    }`}
                  >
                    {selected && (
                      <Icon
                        name="check-circle"
                        className="h-5 w-5 text-accent-500"
                      />
                    )}
                    <span
                      className={`text-sm font-semibold ${
                        selected
                          ? "text-accent-700 dark:text-accent-300"
                          : "text-secondary-700 dark:text-secondary-300"
                      }`}
                    >
                      {t(opt.labelKey)}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Next button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={goNext}
              className="mt-10 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 font-heading text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
            >
              {t("common.next")}
              <Icon
                name={isAr ? "arrow-left" : "arrow-right"}
                className="h-4 w-4"
              />
            </motion.button>
          </motion.section>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 2: Daily Habits                                   */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "daily" && (
          <motion.section
            key="daily"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 text-center">
              <h1 className="font-heading text-xl font-bold text-secondary-900 dark:text-white">
                {t("setup.daily_title")}
              </h1>
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                {t("setup.daily_subtitle")}
              </p>
              {state.dailyHabits.length > 0 && (
                <p className="mt-2 text-xs font-semibold text-primary-600 dark:text-primary-400">
                  {state.dailyHabits.length} {t("gallery.actions_available")}{" "}
                  {t("gallery.added")}
                </p>
              )}
            </div>

            {/* Flat 2-column grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {ACTION_GALLERY.map((ga) => {
                const isSelected = selectedIds.has(ga.id);
                const title = isAr ? ga.titleAr : t(ga.titleKey);

                return (
                  <motion.button
                    key={ga.id}
                    type="button"
                    layout
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGalleryToggle(ga)}
                    className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? "border-primary-400 bg-primary-50 shadow-sm dark:border-primary-600 dark:bg-primary-950/30"
                        : "border-secondary-200 bg-white hover:border-primary-200 dark:border-secondary-700 dark:bg-secondary-800/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white">
                        <Icon name="check" className="h-3 w-3" />
                      </div>
                    )}
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-primary-500 text-white"
                          : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                      }`}
                    >
                      <Icon
                        name={ga.iconName ?? CATEGORY_ICONS[ga.category]}
                        className="h-5 w-5"
                      />
                    </div>
                    <span
                      className={`text-xs font-medium leading-tight ${
                        isSelected
                          ? "text-primary-700 dark:text-primary-300"
                          : "text-secondary-700 dark:text-secondary-200"
                      }`}
                    >
                      {title}
                    </span>
                  </motion.button>
                );
              })}

              {/* Custom action cards already added */}
              {state.dailyHabits
                .filter((h) => h.source === "custom")
                .map((h) => {
                  const title = h.titleKey;
                  return (
                    <motion.div
                      key={h.id}
                      layout
                      className="relative flex flex-col items-center gap-2 rounded-2xl border-2 border-primary-400 bg-primary-50 p-4 text-center shadow-sm dark:border-primary-600 dark:bg-primary-950/30"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setState((prev) => {
                            const next = removeHabit(prev, h.id);
                            saveState(next);
                            return next;
                          });
                        }}
                        className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500 text-white">
                        <Icon name={h.iconName ?? "star"} className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium leading-tight text-primary-700 dark:text-primary-300">
                        {title}
                      </span>
                    </motion.div>
                  );
                })}

              {/* + Add Custom card */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCustomForm(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-secondary-300 p-4 text-center transition-colors hover:border-primary-400 hover:bg-primary-50/50 dark:border-secondary-600 dark:hover:border-primary-600 dark:hover:bg-primary-950/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-400 dark:bg-secondary-700 dark:text-secondary-500">
                  <Icon name="plus" className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                  {t("setup.add_custom")}
                </span>
              </motion.button>
            </div>

            {/* Nav buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300"
              >
                <Icon
                  name={isAr ? "arrow-right" : "arrow-left"}
                  className="h-4 w-4"
                />
                {t("common.back")}
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 font-heading text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                {t("common.next")}
                <Icon
                  name={isAr ? "arrow-left" : "arrow-right"}
                  className="h-4 w-4"
                />
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 3: Monthly Goals                                  */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "monthly" && (
          <motion.section
            key="monthly"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div className="mb-6 text-center">
              <h1 className="font-heading text-xl font-bold text-secondary-900 dark:text-white">
                {t("setup.monthly_title")}
              </h1>
              <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
                {t("setup.monthly_subtitle")}
              </p>
            </div>

            {/* Goal cards in 2-columns */}
            <div className="grid grid-cols-2 gap-2.5">
              {MONTHLY_GOALS_GALLERY.map((goalItem) => {
                const existing = state.monthlyGoals.find(
                  (g) => g.id === goalItem.id,
                );
                const isSelected = !!existing;
                const currentTarget =
                  existing?.target ?? goalItem.defaultTarget;
                const title = isAr ? goalItem.titleAr : t(goalItem.titleKey);

                return (
                  <motion.div
                    key={goalItem.id}
                    layout
                    className={`relative flex flex-col items-center rounded-2xl border-2 p-4 text-center transition-all ${
                      isSelected
                        ? "border-accent-400 bg-accent-50 shadow-sm dark:border-accent-600 dark:bg-accent-950/20"
                        : "border-secondary-200 bg-white hover:border-accent-200 dark:border-secondary-700 dark:bg-secondary-800/60"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${
                        isSelected
                          ? "bg-accent-500 text-white"
                          : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                      }`}
                    >
                      <Icon name={goalItem.iconName} className="h-5 w-5" />
                    </div>

                    {/* Title */}
                    <span
                      className={`mb-3 text-xs font-medium leading-tight ${
                        isSelected
                          ? "text-accent-700 dark:text-accent-300"
                          : "text-secondary-700 dark:text-secondary-200"
                      }`}
                    >
                      {title}
                    </span>

                    {/* Counter: - [count] + */}
                    <div className="mt-auto flex items-center gap-1.5">
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoalDecrement(goalItem);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-700 transition-colors hover:bg-accent-200 dark:bg-accent-900/30 dark:text-accent-300"
                        >
                          <Icon name="minus" className="h-3.5 w-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (!isSelected) {
                            handleGoalIncrement(goalItem);
                          }
                        }}
                        className={`min-w-8 rounded-lg px-2 py-1 text-center text-sm font-bold transition-all ${
                          isSelected
                            ? "bg-accent-500 text-white"
                            : "bg-secondary-100 text-secondary-400 dark:bg-secondary-700 dark:text-secondary-500"
                        }`}
                      >
                        {isSelected ? currentTarget : 0}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoalIncrement(goalItem);
                        }}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                          isSelected
                            ? "bg-accent-100 text-accent-700 hover:bg-accent-200 dark:bg-accent-900/30 dark:text-accent-300"
                            : "bg-secondary-100 text-secondary-500 hover:bg-primary-100 hover:text-primary-600 dark:bg-secondary-700 dark:text-secondary-400"
                        }`}
                      >
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {isSelected && (
                      <span className="mt-1 text-[10px] text-accent-500 dark:text-accent-400">
                        {t("monthly.times")}
                      </span>
                    )}
                  </motion.div>
                );
              })}

              {/* Custom goals already added */}
              {state.monthlyGoals
                .filter((g) => g.source === "custom")
                .map((goal) => {
                  const title = isAr ? goal.titleAr : goal.titleKey;
                  return (
                    <motion.div
                      key={goal.id}
                      layout
                      className="relative flex flex-col items-center rounded-2xl border-2 border-accent-400 bg-accent-50 p-4 text-center shadow-sm dark:border-accent-600 dark:bg-accent-950/20"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setState((prev) => {
                            const next = removeMonthlyGoal(prev, goal.id);
                            saveState(next);
                            return next;
                          });
                        }}
                        className="absolute end-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                      >
                        <Icon name="close" className="h-3 w-3" />
                      </button>
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
                        <Icon name={goal.iconName} className="h-5 w-5" />
                      </div>
                      <span className="mb-3 text-xs font-medium leading-tight text-accent-700 dark:text-accent-300">
                        {title}
                      </span>
                      <div className="mt-auto flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            handleGoalTargetChange(goal.id, goal.target - 1)
                          }
                          disabled={goal.target <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-700 transition-colors hover:bg-accent-200 disabled:opacity-40 dark:bg-accent-900/30 dark:text-accent-300"
                        >
                          <Icon name="minus" className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-8 rounded-lg bg-accent-500 px-2 py-1 text-center text-sm font-bold text-white">
                          {goal.target}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleGoalTargetChange(goal.id, goal.target + 1)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-700 transition-colors hover:bg-accent-200 dark:bg-accent-900/30 dark:text-accent-300"
                        >
                          <Icon name="plus" className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="mt-1 text-[10px] text-accent-500 dark:text-accent-400">
                        {t("monthly.times")}
                      </span>
                    </motion.div>
                  );
                })}

              {/* + Add Custom goal card */}
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCustomGoalForm(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-secondary-300 p-4 text-center transition-colors hover:border-accent-400 hover:bg-accent-50/50 dark:border-secondary-600 dark:hover:border-accent-600 dark:hover:bg-accent-950/10"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary-100 text-secondary-400 dark:bg-secondary-700 dark:text-secondary-500">
                  <Icon name="plus" className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-secondary-500 dark:text-secondary-400">
                  {t("setup.add_custom")}
                </span>
              </motion.button>
            </div>

            {/* Nav buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1 rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-sm font-medium text-secondary-600 transition-colors hover:bg-secondary-50 dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300"
              >
                <Icon
                  name={isAr ? "arrow-right" : "arrow-left"}
                  className="h-4 w-4"
                />
                {t("common.back")}
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3 font-heading text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700"
              >
                {t("common.next")}
                <Icon
                  name={isAr ? "arrow-left" : "arrow-right"}
                  className="h-4 w-4"
                />
              </motion.button>
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 4: Summary                                        */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "summary" && (
          <motion.section
            key="summary"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center text-center"
          >
            {/* Decorative crescent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-accent-500 shadow-lg shadow-primary-500/25"
            >
              <Icon name="moon-star" className="h-10 w-10 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-heading text-2xl font-bold text-secondary-900 dark:text-white"
            >
              {t("setup.summary_title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-1 text-sm text-secondary-500 dark:text-secondary-400"
            >
              {t("setup.summary_subtitle")}
            </motion.p>

            {/* Stats cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-8 grid w-full grid-cols-3 gap-3"
            >
              {/* Basics */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/60">
                <Icon
                  name="shield-check"
                  className="h-6 w-6 text-primary-500"
                />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">
                  {state.enabledBasics.length}
                </span>
                <span className="text-[10px] leading-tight text-secondary-500 dark:text-secondary-400">
                  {t("setup.summary_basics")}
                </span>
              </div>
              {/* Daily habits */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/60">
                <Icon name="sparkles" className="h-6 w-6 text-primary-500" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">
                  {state.dailyHabits.length}
                </span>
                <span className="text-[10px] leading-tight text-secondary-500 dark:text-secondary-400">
                  {t("setup.summary_habits")}
                </span>
              </div>
              {/* Monthly goals */}
              <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/60">
                <Icon name="target" className="h-6 w-6 text-accent-500" />
                <span className="text-xl font-bold text-secondary-900 dark:text-white">
                  {state.monthlyGoals.length}
                </span>
                <span className="text-[10px] leading-tight text-secondary-500 dark:text-secondary-400">
                  {t("setup.summary_goals")}
                </span>
              </div>
            </motion.div>

            {/* Hadith + encouragement */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 rounded-2xl bg-secondary-50 p-5 dark:bg-secondary-800/40"
            >
              <p className="text-sm italic leading-relaxed text-secondary-600 dark:text-secondary-300">
                {t("setup.summary_hadith")}
              </p>
              <p className="mt-2 text-xs text-secondary-400">
                {t("setup.summary_hadith_source")}
              </p>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 text-sm text-secondary-500 dark:text-secondary-400"
            >
              {t("setup.summary_encouragement")}
            </motion.p>

            {/* Bismillah CTA */}
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleComplete}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-primary-600 to-accent-600 px-6 py-4 font-heading text-base font-bold text-white shadow-xl shadow-primary-600/30 transition-all hover:shadow-2xl hover:shadow-primary-600/40"
            >
              {t("setup.bismillah")}
            </motion.button>

            {/* Back link */}
            <button
              type="button"
              onClick={goBack}
              className="mt-4 text-sm text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              ← {t("common.back")}
            </button>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCustomForm && (
          <CustomHabitModal
            t={t}
            onAdd={handleAddCustom}
            onClose={() => setShowCustomForm(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCustomGoalForm && (
          <CustomGoalModal
            t={t}
            onAdd={handleAddCustomGoal}
            onClose={() => setShowCustomGoalForm(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Light Burst Transition ── */}
      <AnimatePresence>
        {showLightBurst && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Central light burst */}
            <motion.div
              className="absolute rounded-full bg-primary-400/60"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ width: "300vmax", height: "300vmax", opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            {/* White overlay fade */}
            <motion.div
              className="absolute inset-0 bg-white dark:bg-secondary-950"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            />
            {/* Radial sparkle rays */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 origin-left rounded-full bg-accent-300/80"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
                initial={{ width: 0, opacity: 0.8 }}
                animate={{ width: "60vmax", opacity: 0 }}
                transition={{
                  duration: 0.9,
                  ease: "easeOut",
                  delay: 0.05 * i,
                }}
              />
            ))}
            {/* بسم الله text fading in center */}
            <motion.span
              className="relative z-10 text-3xl font-bold text-primary-700 dark:text-primary-300"
              style={{ fontFamily: "var(--font-arabic)" }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.7, 1.1, 1, 1] }}
              transition={{ duration: 1.4, times: [0, 0.3, 0.7, 1] }}
            >
              بسم الله
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Custom Habit Modal
// ══════════════════════════════════════════════════════════════

function CustomHabitModal({
  t,
  onAdd,
  onClose,
}: {
  t: (key: string) => string;
  onAdd: (fields: {
    title: string;
    description: string;
    category: WorshipCategory;
    target?: number;
    unit?: string;
  }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<WorshipCategory>("prayer");

  const canSubmit = title.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      category,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-secondary-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-secondary-900 dark:text-white">
            {t("gallery.create_title")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_title")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("gallery.field_title_placeholder")}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 placeholder-secondary-400 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-secondary-700 dark:bg-secondary-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_description")}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("gallery.field_description_placeholder")}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 placeholder-secondary-400 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-secondary-700 dark:bg-secondary-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_category")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                    category === cat.id
                      ? "bg-primary-500 text-white"
                      : "bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300"
                  }`}
                >
                  <Icon name={CATEGORY_ICONS[cat.id]} className="h-3 w-3" />
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-4 w-full rounded-xl bg-primary-500 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("gallery.save_action")}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// Custom Goal Modal
// ══════════════════════════════════════════════════════════════

function CustomGoalModal({
  t,
  onAdd,
  onClose,
}: {
  t: (key: string) => string;
  onAdd: (fields: {
    title: string;
    description: string;
    target: number;
    category: WorshipCategory;
  }) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("5");
  const [category, setCategory] = useState<WorshipCategory>("prayer");

  const canSubmit = title.trim().length > 0 && Number.parseInt(target, 10) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      target: Number.parseInt(target, 10),
      category,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl dark:bg-secondary-800"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-secondary-900 dark:text-white">
            {t("gallery.create_title")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_title")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("gallery.field_title_placeholder")}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 placeholder-secondary-400 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-secondary-700 dark:bg-secondary-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_description")}
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("gallery.field_description_placeholder")}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 placeholder-secondary-400 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-secondary-700 dark:bg-secondary-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("monthly.target")}
            </label>
            <input
              type="number"
              min="1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full rounded-xl border border-secondary-200 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 dark:border-secondary-700 dark:bg-secondary-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary-600 dark:text-secondary-400">
              {t("gallery.field_category")}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                    category === cat.id
                      ? "bg-accent-500 text-white"
                      : "bg-secondary-100 text-secondary-600 dark:bg-secondary-700 dark:text-secondary-300"
                  }`}
                >
                  <Icon name={CATEGORY_ICONS[cat.id]} className="h-3 w-3" />
                  {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="mt-4 w-full rounded-xl bg-accent-500 py-2.5 text-sm font-medium text-white hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t("gallery.save_action")}
        </button>
      </motion.div>
    </motion.div>
  );
}
