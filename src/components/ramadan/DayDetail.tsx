// ============================================================
// Ramadan Companion — Day Detail View (Two-Layer)
// Shows basics, daily habits, monthly goals, and reflection
// for a specific day. Basics are auto-checked (uncheck if
// missed). Monthly goals show per-goal progress bars.
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, AppState, DayEntry } from "@/lib/app-types";
import { BASICS, getDateString, getRamadanDay } from "@/lib/gallery";
import type { IconName } from "@/lib/icons";
import { Icon } from "@/lib/icons";
import {
  ensureDayEntry,
  getDayStats,
  getMonthlyGoalDayCount,
  getMonthlyGoalProgress,
  saveState,
  setMonthlyGoalCount,
  setReflection,
  toggleBasicCompletion,
  toggleCompletion,
} from "@/lib/store";
import { motion } from "framer-motion";
import { useCallback } from "react";

// ── Category Icons ───────────────────────────────────────────

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

interface DayDetailProps {
  locale: AppLocale;
  date: string;
  state: AppState;
  onStateChange: (state: AppState) => void;
  onClose: () => void;
  onSave?: () => void;
}

// ── Component ────────────────────────────────────────────────

export function DayDetail({
  locale,
  date,
  state,
  onStateChange,
  onClose,
  onSave,
}: DayDetailProps) {
  const t = createTranslator(locale);
  const isAr = locale === "ar";
  const today = getDateString();
  const isToday = date === today;
  const isFuture = date > today;
  const ramadanDay = getRamadanDay(date, state.ramadanStartDate);
  const dayLabel =
    ramadanDay > 0 && ramadanDay <= 30
      ? `${t("common.day")} ${ramadanDay}`
      : date;

  // Ensure day entry exists
  const stateWithDay = ensureDayEntry(state, date);
  const entry: DayEntry = stateWithDay.days[date];
  const stats = getDayStats(stateWithDay, date);

  // Enabled basics
  const enabledBasics = BASICS.filter((b) =>
    state.enabledBasics.includes(b.id),
  );

  // Active daily habits (enabled only; no frequency filtering needed)
  const todayHabits = state.dailyHabits.filter((h) => h.enabled);

  // Monthly goals
  const monthlyGoals = state.monthlyGoals;

  // ── Handlers ───────────────────────────────────────────────

  const handleToggleBasic = useCallback(
    (basicId: string) => {
      const next = toggleBasicCompletion(stateWithDay, date, basicId);
      saveState(next);
      onStateChange(next);
    },
    [stateWithDay, date, onStateChange],
  );

  const handleToggleHabit = useCallback(
    (habitId: string) => {
      const next = toggleCompletion(stateWithDay, date, habitId);
      saveState(next);
      onStateChange(next);
    },
    [stateWithDay, date, onStateChange],
  );

  const handleSetMonthlyGoalCount = useCallback(
    (goalId: string, count: number) => {
      const next = setMonthlyGoalCount(stateWithDay, date, goalId, count);
      saveState(next);
      onStateChange(next);
    },
    [stateWithDay, date, onStateChange],
  );

  const handleReflection = useCallback(
    (text: string) => {
      const next = setReflection(stateWithDay, date, text);
      saveState(next);
      onStateChange(next);
    },
    [stateWithDay, date, onStateChange],
  );

  // ── Percent ring ───────────────────────────────────────────

  const ringRadius = 42;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference - (stats.percent / 100) * ringCircumference;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg px-4 pb-8 pt-4">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 transition-colors hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-300"
        >
          <Icon
            name={isAr ? "chevron-right" : "chevron-left"}
            className="h-4 w-4"
          />
        </button>
        <div className="flex-1">
          <h2
            className="text-lg font-bold text-secondary-900 dark:text-white"
            style={{
              fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
            }}
          >
            {dayLabel}
          </h2>
          <p className="text-xs text-secondary-500 dark:text-secondary-400">
            {isToday ? t("day.today") : date}
          </p>
        </div>
        {/* Score ring */}
        <div className="relative h-12 w-12">
          <svg className="-rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-secondary-200 dark:text-secondary-700"
            />
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              className={
                stats.percent >= 80
                  ? "text-primary-500"
                  : stats.percent >= 50
                    ? "text-accent-500"
                    : "text-red-400"
              }
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-secondary-700 dark:text-secondary-300">
            {stats.percent}%
          </span>
        </div>
      </div>

      {isFuture && (
        <div className="mb-6 rounded-xl bg-secondary-100 p-4 text-center text-sm text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400">
          {t("day.future_message")}
        </div>
      )}

      {/* ── Layer 1a: Basics ── */}
      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
          <Icon name="shield-check" className="h-4 w-4 text-primary-500" />
          {t("day.basics_title")}
        </h3>
        <div className="space-y-2">
          {enabledBasics.map((basic) => {
            const done = entry.basics[basic.id] !== false;
            return (
              <motion.button
                key={basic.id}
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => !isFuture && handleToggleBasic(basic.id)}
                disabled={isFuture}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ${
                  done
                    ? "border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/20"
                    : "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    done
                      ? "bg-primary-500 text-white"
                      : "bg-red-100 text-red-500 dark:bg-red-900/30"
                  }`}
                >
                  <Icon name={basic.iconName} className="h-4 w-4" />
                </div>
                <span
                  className={`flex-1 text-sm font-medium ${
                    done
                      ? "text-secondary-900 dark:text-white"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {isAr ? basic.titleAr : t(basic.titleKey)}
                </span>
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-primary-500 text-white"
                      : "border-2 border-red-300 dark:border-red-700"
                  }`}
                >
                  {done && <Icon name="check" className="h-3.5 w-3.5" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Layer 1b: Daily Habits ── */}
      {todayHabits.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
            <Icon name="check-circle" className="h-4 w-4 text-primary-500" />
            {t("day.daily_title")}
          </h3>
          <p className="mb-3 text-xs text-secondary-400">
            {stats.dailyDone}/{stats.dailyTotal} {t("day.completed")}
          </p>
          <div className="space-y-2">
            {todayHabits.map((habit) => {
              const done = !!entry.completions[habit.id];
              const icon =
                habit.iconName ?? CATEGORY_ICONS[habit.category] ?? "check";
              const title = t(habit.titleKey);

              return (
                <motion.button
                  key={habit.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !isFuture && handleToggleHabit(habit.id)}
                  disabled={isFuture}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3.5 text-start transition-all ${
                    done
                      ? "border-primary-200 bg-primary-50/50 dark:border-primary-800 dark:bg-primary-950/20"
                      : "border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800/60"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                      done
                        ? "bg-primary-500 text-white"
                        : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                    }`}
                  >
                    <Icon name={icon as IconName} className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-medium ${
                        done
                          ? "text-secondary-900 dark:text-white"
                          : "text-secondary-700 dark:text-secondary-300"
                      }`}
                    >
                      {title}
                    </span>
                    {habit.target && (
                      <span className="ms-2 text-xs text-secondary-400">
                        {habit.target}
                        {habit.unitKey ? ` ${t(habit.unitKey)}` : ""}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                      done
                        ? "bg-primary-500 text-white"
                        : "border-2 border-secondary-300 dark:border-secondary-600"
                    }`}
                  >
                    {done && <Icon name="check" className="h-3.5 w-3.5" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Layer 2: Monthly Goals ── */}
      {monthlyGoals.length > 0 && (
        <section className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
            <Icon name="target" className="h-4 w-4 text-accent-500" />
            {t("day.monthly_title")}
          </h3>
          <div className="space-y-2">
            {monthlyGoals.map((goal) => {
              const todayCount = getMonthlyGoalDayCount(entry, goal.id);
              const totalProgress = getMonthlyGoalProgress(state, goal.id);
              const progressPercent = Math.min(
                (totalProgress / goal.target) * 100,
                100,
              );
              const exceeded = totalProgress > goal.target;
              const title = isAr ? goal.titleAr : t(goal.titleKey);

              return (
                <motion.div
                  key={goal.id}
                  layout
                  className={`rounded-2xl border transition-all ${
                    todayCount > 0
                      ? "border-accent-200 bg-accent-50/50 dark:border-accent-800 dark:bg-accent-950/20"
                      : "border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800/60"
                  }`}
                >
                  {/* Goal info + stepper */}
                  <div className="flex items-center gap-3 p-3.5">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        todayCount > 0
                          ? "bg-accent-500 text-white"
                          : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                      }`}
                    >
                      <Icon name={goal.iconName} className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-sm font-medium ${
                          todayCount > 0
                            ? "text-accent-700 dark:text-accent-300"
                            : "text-secondary-700 dark:text-secondary-300"
                        }`}
                      >
                        {title}
                      </span>
                    </div>
                    {/* +/- stepper */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          !isFuture &&
                          handleSetMonthlyGoalCount(goal.id, todayCount - 1)
                        }
                        disabled={isFuture || todayCount <= 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary-100 text-secondary-600 transition-colors hover:bg-secondary-200 disabled:opacity-30 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600"
                      >
                        <Icon name="minus" className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[1.75rem] text-center text-sm font-bold text-secondary-900 dark:text-white">
                        {todayCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          !isFuture &&
                          handleSetMonthlyGoalCount(goal.id, todayCount + 1)
                        }
                        disabled={isFuture}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-100 text-accent-600 transition-colors hover:bg-accent-200 disabled:opacity-30 dark:bg-accent-900/30 dark:text-accent-400 dark:hover:bg-accent-800/40"
                      >
                        <Icon name="plus" className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="border-t border-secondary-100 px-3.5 py-2.5 dark:border-secondary-700/50">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-secondary-500">
                        {t("monthly.progress")}
                      </span>
                      <span
                        className={`font-medium ${exceeded ? "text-accent-600 dark:text-accent-400" : "text-secondary-600 dark:text-secondary-300"}`}
                      >
                        {totalProgress}/{goal.target} {t("monthly.times")}
                        {exceeded && (
                          <span className="ms-1 text-accent-500">
                            {t("monthly.exceeded")}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-700">
                      <motion.div
                        className={`h-full rounded-full ${
                          exceeded
                            ? "bg-gradient-to-r from-accent-400 to-amber-400"
                            : "bg-accent-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(progressPercent, 100)}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    {exceeded && (
                      <p className="mt-1 text-xs font-medium text-accent-600 dark:text-accent-400">
                        ما شاء الله! 🎉
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Reflection ── */}
      <section className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-secondary-500 dark:text-secondary-400">
          <Icon name="edit-3" className="h-4 w-4 text-primary-500" />
          {t("day.reflection_title")}
        </h3>
        <textarea
          value={entry.reflection || ""}
          onChange={(e) => handleReflection(e.target.value)}
          disabled={isFuture}
          placeholder={t("day.reflection_placeholder")}
          rows={3}
          className="w-full resize-none rounded-2xl border border-secondary-200 bg-white px-4 py-3 text-sm text-secondary-900 placeholder-secondary-400 outline-none transition-colors focus:border-primary-400 focus:ring-1 focus:ring-primary-400 disabled:opacity-60 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder-secondary-500"
        />
      </section>

      {/* ── Day summary ── */}
      <div className="rounded-2xl bg-secondary-50 p-4 dark:bg-secondary-800/60">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {stats.basicsDone}/{stats.basicsTotal}
            </p>
            <p className="text-xs text-secondary-500">
              {t("day.basics_title")}
            </p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {stats.dailyDone}/{stats.dailyTotal}
            </p>
            <p className="text-xs text-secondary-500">{t("day.daily_title")}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-accent-600 dark:text-accent-400">
              {stats.monthlyDone}
            </p>
            <p className="text-xs text-secondary-500">
              {t("day.monthly_title")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Save & Close Button ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          if (onSave) onSave();
          else onClose();
        }}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 transition-colors hover:bg-primary-700 active:bg-primary-800"
        style={{
          fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
        }}
      >
        <Icon name="check" className="h-4 w-4" />
        {t("day.save_and_close")}
      </motion.button>
    </div>
  );
}
