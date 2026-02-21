// ============================================================
// Ramadan Companion — Progress View (Two-Layer)
// Overview: streaks, totals, category breakdown,
// monthly goals progress with per-goal bars.
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale } from "@/lib/app-types";
import { BASICS } from "@/lib/gallery";
import type { IconName } from "@/lib/icons";
import { Icon } from "@/lib/icons";
import {
  calculateStreak,
  getCurrentRamadanDay,
  getLongestStreak,
  getMonthlyGoalProgress,
  getTotalCompleted,
  loadState,
} from "@/lib/store";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

// ── Category Icons ───────────────────────────────────────────

// @ts-expect-error -- used in markup below, TS can't infer
const CATEGORY_ICONS: Record<string, IconName> = {
  prayer: "prayer",
  quran: "quran",
  dhikr: "dhikr",
  charity: "charity",
  dua: "dua",
  fasting: "fasting",
  learning: "learning",
};

// ── Props ────────────────────────────────────────────────────

interface ProgressViewProps {
  locale: AppLocale;
}

// ── Component ────────────────────────────────────────────────

export function ProgressView({ locale }: ProgressViewProps) {
  const t = createTranslator(locale);
  const isAr = locale === "ar";

  const [state] = useState(() => loadState());

  const currentStreak = calculateStreak(state);
  const longestStreak = getLongestStreak(state);
  const totalCompleted = getTotalCompleted(state);
  const currentDay = getCurrentRamadanDay(state);
  const daysActive = Object.keys(state.days).length;

  // ── Category breakdown (basics + daily habits) ─────────

  const categoryBreakdown = useMemo(() => {
    // Count enabled basics
    const enabledBasics = BASICS.filter((b) =>
      state.enabledBasics.includes(b.id),
    );
    const basicsTotal = enabledBasics.length;
    let basicsDone = 0;

    // Count daily habits
    const activeHabits = state.dailyHabits.filter((h) => h.enabled);
    const dailyTotal = activeHabits.length;
    let dailyDone = 0;

    // Aggregate across all days
    for (const entry of Object.values(state.days)) {
      basicsDone += enabledBasics.filter(
        (b) => entry.basics[b.id] !== false,
      ).length;
      dailyDone += activeHabits.filter((h) => entry.completions[h.id]).length;
    }

    const basicsPercent =
      basicsTotal * daysActive > 0
        ? Math.round((basicsDone / (basicsTotal * daysActive)) * 100)
        : 100;
    const dailyPercent =
      dailyTotal * daysActive > 0
        ? Math.round((dailyDone / (dailyTotal * daysActive)) * 100)
        : 0;

    return {
      basicsTotal,
      basicsDone,
      basicsPercent,
      dailyTotal,
      dailyDone,
      dailyPercent,
    };
  }, [state, daysActive]);

  // ── Monthly goal progress ──────────────────────────────

  const goalProgress = useMemo(() => {
    return state.monthlyGoals.map((goal) => ({
      goal,
      progress: getMonthlyGoalProgress(state, goal.id),
    }));
  }, [state]);

  // ── Ring helper ────────────────────────────────────────

  const renderRing = (
    percent: number,
    colorClass: string,
    size = 80,
    strokeWidth = 6,
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-secondary-200 dark:text-secondary-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClass}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
    );
  };

  // ── Render ─────────────────────────────────────────────

  return (
    <div data-hydrated="true" className="mx-auto max-w-lg px-5 pb-10 pt-5">
      {/* Header */}
      <div className="mb-7 text-center">
        <h2 className="font-heading text-2xl font-black text-secondary-900 dark:text-white">
          {t("progress.title")}
        </h2>
        <p className="mt-1.5 text-sm font-medium text-secondary-500 dark:text-secondary-400">
          {currentDay > 0 && currentDay <= 30
            ? `${t("common.day")} ${currentDay} ${t("progress.of_ramadan")}`
            : t("progress.subtitle")}
        </p>
      </div>

      {/* Stats cards — bigger, bolder */}
      <div className="mb-7 grid grid-cols-2 gap-3.5">
        {[
          {
            icon: "flame" as IconName,
            value: currentStreak,
            label: t("progress.current_streak"),
            colorClass: "text-accent-500",
            bgClass: "bg-accent-50 dark:bg-accent-950/20",
          },
          {
            icon: "trophy" as IconName,
            value: longestStreak,
            label: t("progress.longest_streak"),
            colorClass: "text-primary-500",
            bgClass: "bg-primary-50 dark:bg-primary-950/20",
          },
          {
            icon: "check-circle" as IconName,
            value: totalCompleted,
            label: t("progress.total_completed"),
            colorClass: "text-primary-500",
            bgClass: "bg-primary-50 dark:bg-primary-950/20",
          },
          {
            icon: "calendar" as IconName,
            value: daysActive,
            label: t("progress.days_active"),
            colorClass: "text-accent-500",
            bgClass: "bg-accent-50 dark:bg-accent-950/20",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border-2 border-secondary-200 p-5 dark:border-secondary-700 ${stat.bgClass}`}
          >
            <Icon
              name={stat.icon}
              className={`mb-2.5 h-6 w-6 ${stat.colorClass}`}
            />
            <p className="text-3xl font-black text-secondary-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Category breakdown — 2 rings (basics + daily) — bigger */}
      <section className="mb-7">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
          {t("progress.category_title")}
        </h3>
        <div className="flex items-center justify-center gap-10">
          {/* Basics ring */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {renderRing(categoryBreakdown.basicsPercent, "text-primary-500", 96, 8)}
              <span className="absolute inset-0 flex items-center justify-center text-base font-black text-secondary-700 dark:text-secondary-300">
                {categoryBreakdown.basicsPercent}%
              </span>
            </div>
            <p className="mt-2.5 text-sm font-semibold text-secondary-600 dark:text-secondary-400">
              {t("progress.basics_label")}
            </p>
          </div>

          {/* Daily habits ring */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {renderRing(categoryBreakdown.dailyPercent, "text-emerald-500", 96, 8)}
              <span className="absolute inset-0 flex items-center justify-center text-base font-black text-secondary-700 dark:text-secondary-300">
                {categoryBreakdown.dailyPercent}%
              </span>
            </div>
            <p className="mt-2.5 text-sm font-semibold text-secondary-600 dark:text-secondary-400">
              {t("progress.daily_label")}
            </p>
          </div>
        </div>
      </section>

      {/* Monthly Goals Progress — bigger */}
      {goalProgress.length > 0 && (
        <section className="mb-7">
          <h3 className="mb-4 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
            <Icon name="target" className="h-5 w-5 text-accent-500" />
            {t("progress.monthly_label")}
          </h3>
          <div className="space-y-3">
            {goalProgress.map(({ goal, progress }) => {
              const percent = Math.min((progress / goal.target) * 100, 100);
              const exceeded = progress > goal.target;
              const title = isAr ? goal.titleAr : t(goal.titleKey);

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-secondary-200 bg-white p-5 dark:border-secondary-700 dark:bg-secondary-800/60"
                >
                  <div className="mb-3 flex items-center gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 dark:text-accent-400">
                      <Icon name={goal.iconName} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-secondary-900 dark:text-white">
                        {title}
                      </p>
                    </div>
                    <span
                      className={`text-base font-black ${
                        exceeded
                          ? "text-accent-600 dark:text-accent-400"
                          : "text-secondary-600 dark:text-secondary-300"
                      }`}
                    >
                      {progress}/{goal.target}
                    </span>
                  </div>
                  <div className="h-3.5 overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-700">
                    <motion.div
                      className={`h-full rounded-full ${
                        exceeded
                          ? "bg-gradient-to-r from-accent-400 to-amber-400"
                          : "bg-accent-500"
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  {exceeded && (
                    <p className="mt-2 text-sm font-bold text-accent-600 dark:text-accent-400">
                      {t("monthly.exceeded")} ما شاء الله! 🎉
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Empty state if no goals */}
      {goalProgress.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-secondary-300 p-7 text-center dark:border-secondary-600">
          <Icon
            name="target"
            className="mx-auto mb-3 h-10 w-10 text-secondary-300 dark:text-secondary-600"
          />
          <p className="text-base font-medium text-secondary-500 dark:text-secondary-400">
            {t("progress.no_goals")}
          </p>
        </div>
      )}

      {/* Consistency summary — bigger */}
      {daysActive > 0 && (
        <section className="mt-7 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50 p-6 dark:from-primary-950/30 dark:to-accent-950/30">
          <h3 className="mb-2 text-base font-bold text-secondary-700 dark:text-secondary-300">
            {t("progress.consistency_title")}
          </h3>
          <p className="text-base text-secondary-600 dark:text-secondary-400">
            {t("progress.consistency_message")
              .replace("{days}", String(daysActive))
              .replace("{total}", String(totalCompleted))
              .replace("{streak}", String(currentStreak))}
          </p>
        </section>
      )}
    </div>
  );
}
