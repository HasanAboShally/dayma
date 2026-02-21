// ============================================================
// Ramadan Companion — Day Detail View (Two-Layer)
// Shows basics, daily habits, monthly goals, and reflection
// for a specific day. Basics start unchecked — users confirm
// each one for full satisfaction. Progressive celebrations
// at 25/50/75/100%. Warm save moment with affirming message.
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, AppState, DayEntry } from "@/lib/app-types";
import { fireConfetti, haptic, playSound } from "@/lib/feedback";
import { BASICS, getDateString, getRamadanDay } from "@/lib/gallery";
import type { IconName } from "@/lib/icons";
import { Icon } from "@/lib/icons";
import { getReflectionPrompt } from "@/lib/reflection-prompts";
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
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Was this day previously empty? (for warm return)
  const hadPreviousEntry = !!state.days[date];
  const isPastMissed = !isToday && !isFuture && !hadPreviousEntry;

  // Progressive celebration tracking
  const prevPercentRef = useRef(stats.percent);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);

  // Bismillah opening
  const [showBismillah, setShowBismillah] = useState(true);

  // Warm save overlay
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Daily reflection prompt
  const reflectionPrompt =
    ramadanDay > 0 && ramadanDay <= 30
      ? getReflectionPrompt(ramadanDay, locale)
      : t("day.reflection_placeholder");

  // Bismillah auto-dismiss
  useEffect(() => {
    const timer = setTimeout(() => setShowBismillah(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Progressive celebrations — detect threshold crossings
  useEffect(() => {
    const prev = prevPercentRef.current;
    const curr = stats.percent;
    if (curr > prev) {
      const milestones = [
        { at: 100, key: "celebration.complete", fx: "big" as const },
        { at: 75, key: "celebration.three_quarter", fx: "medium" as const },
        { at: 50, key: "celebration.half", fx: "medium" as const },
        { at: 25, key: "celebration.quarter", fx: "small" as const },
      ];
      for (const m of milestones) {
        if (prev < m.at && curr >= m.at) {
          setCelebrationMsg(t(m.key));
          if (m.at === 100) {
            fireConfetti("big");
            playSound("celebrate");
            haptic("heavy");
          } else if (m.at >= 50) {
            fireConfetti("medium");
            playSound("complete");
            haptic("medium");
          } else {
            playSound("check");
            haptic("light");
          }
          setTimeout(() => setCelebrationMsg(null), 2500);
          break;
        }
      }
    }
    prevPercentRef.current = curr;
  }, [stats.percent, t]);

  // ── Handlers ───────────────────────────────────────────────

  const handleToggleBasic = useCallback(
    (basicId: string) => {
      const next = toggleBasicCompletion(stateWithDay, date, basicId);
      saveState(next);
      onStateChange(next);
      haptic("light");
      playSound("check");
    },
    [stateWithDay, date, onStateChange],
  );

  const handleToggleHabit = useCallback(
    (habitId: string) => {
      const next = toggleCompletion(stateWithDay, date, habitId);
      saveState(next);
      onStateChange(next);
      haptic("light");
      playSound("check");
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
    <div className="mx-auto max-w-lg px-5 pb-10 pt-5">
      {/* Bismillah opening — fades in then out */}
      <AnimatePresence>
        {showBismillah && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 text-center"
          >
            <p
              className="text-xl font-bold text-primary-600/80 dark:text-primary-400/80"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              {t("bismillah")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progressive celebration toast */}
      <AnimatePresence>
        {celebrationMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 rounded-2xl bg-gradient-to-r from-primary-500 to-emerald-500 px-5 py-3.5 text-center text-lg font-black text-white shadow-lg"
            style={{
              fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
            }}
          >
            {celebrationMsg}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-100 text-secondary-600 transition-colors hover:bg-secondary-200 active:scale-95 dark:bg-secondary-800 dark:text-secondary-300"
        >
          <Icon
            name={isAr ? "chevron-right" : "chevron-left"}
            className="h-5 w-5"
          />
        </button>
        <div className="flex-1">
          <h2
            className="text-xl font-black text-secondary-900 dark:text-white"
            style={{
              fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
            }}
          >
            {dayLabel}
          </h2>
          <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400">
            {isToday ? t("day.today") : date}
          </p>
        </div>
        {/* Score ring — bigger */}
        <div className="relative h-16 w-16">
          <svg className="-rotate-90" viewBox="0 0 96 96">
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-secondary-200 dark:text-secondary-700"
            />
            <circle
              cx="48"
              cy="48"
              r={ringRadius}
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
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
          <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-secondary-700 dark:text-secondary-300">
            {stats.percent}%
          </span>
        </div>
      </div>

      {isFuture && (
        <div className="mb-6 rounded-2xl bg-secondary-100 p-5 text-center text-base font-medium text-secondary-500 dark:bg-secondary-800 dark:text-secondary-400">
          {t("day.future_message")}
        </div>
      )}

      {/* Warm return for missed past days */}
      {isPastMissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl border-2 border-primary-200 bg-primary-50/60 p-5 text-center dark:border-primary-800 dark:bg-primary-950/30"
        >
          <p
            className="mb-1 text-base font-bold text-primary-700 dark:text-primary-300"
            style={{
              fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
            }}
          >
            {t("warm_return.title")}
          </p>
          <p className="text-sm font-medium text-primary-600/80 dark:text-primary-400/80">
            {t("warm_return.message")}
          </p>
        </motion.div>
      )}

      {/* ── Layer 1a: Basics ── */}
      <section className="mb-7">
        <h3 className="mb-4 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
          <Icon name="shield-check" className="h-5 w-5 text-primary-500" />
          {t("day.basics_title")}
        </h3>
        <div className="space-y-2.5">
          {enabledBasics.map((basic) => {
            const done = entry.basics[basic.id] === true;
            return (
              <motion.button
                key={basic.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => !isFuture && handleToggleBasic(basic.id)}
                disabled={isFuture}
                className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-start transition-all ${
                  done
                    ? "border-primary-200 bg-primary-50/60 dark:border-primary-800 dark:bg-primary-950/20"
                    : "border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800/60"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    done
                      ? "bg-primary-500 text-white shadow-sm shadow-primary-500/30"
                      : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                  }`}
                >
                  <Icon name={basic.iconName} className="h-5 w-5" />
                </div>
                <span
                  className={`flex-1 text-base font-semibold ${
                    done
                      ? "text-secondary-900 dark:text-white"
                      : "text-secondary-700 dark:text-secondary-300"
                  }`}
                >
                  {isAr ? basic.titleAr : t(basic.titleKey)}
                </span>
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                    done
                      ? "bg-primary-500 text-white"
                      : "border-2 border-secondary-300 dark:border-secondary-600"
                  }`}
                >
                  {done && <Icon name="check" className="h-4 w-4" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ── Layer 1b: Daily Habits ── */}
      {todayHabits.length > 0 && (
        <section className="mb-7">
          <h3 className="mb-3 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
            <Icon name="check-circle" className="h-5 w-5 text-primary-500" />
            {t("day.daily_title")}
          </h3>
          <p className="mb-3 text-sm font-semibold text-secondary-500">
            {stats.dailyDone}/{stats.dailyTotal} {t("day.completed")}
          </p>
          <div className="space-y-2.5">
            {todayHabits.map((habit) => {
              const done = !!entry.completions[habit.id];
              const icon =
                habit.iconName ?? CATEGORY_ICONS[habit.category] ?? "check";
              const title = t(habit.titleKey);

              return (
                <motion.button
                  key={habit.id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => !isFuture && handleToggleHabit(habit.id)}
                  disabled={isFuture}
                  className={`flex w-full items-center gap-3.5 rounded-2xl border-2 p-4 text-start transition-all ${
                    done
                      ? "border-primary-200 bg-primary-50/60 dark:border-primary-800 dark:bg-primary-950/20"
                      : "border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800/60"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      done
                        ? "bg-primary-500 text-white shadow-sm shadow-primary-500/30"
                        : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                    }`}
                  >
                    <Icon name={icon as IconName} className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-base font-semibold ${
                        done
                          ? "text-secondary-900 dark:text-white"
                          : "text-secondary-700 dark:text-secondary-300"
                      }`}
                    >
                      {title}
                    </span>
                    {habit.target && (
                      <span className="ms-2 text-sm text-secondary-400">
                        {habit.target}
                        {habit.unitKey ? ` ${t(habit.unitKey)}` : ""}
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                      done
                        ? "bg-primary-500 text-white"
                        : "border-2 border-secondary-300 dark:border-secondary-600"
                    }`}
                  >
                    {done && <Icon name="check" className="h-4 w-4" />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Layer 2: Monthly Goals ── */}
      {monthlyGoals.length > 0 && (
        <section className="mb-7">
          <h3 className="mb-3 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
            <Icon name="target" className="h-5 w-5 text-accent-500" />
            {t("day.monthly_title")}
          </h3>
          <div className="space-y-2.5">
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
                  className={`rounded-2xl border-2 transition-all ${
                    todayCount > 0
                      ? "border-accent-200 bg-accent-50/60 dark:border-accent-800 dark:bg-accent-950/20"
                      : "border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800/60"
                  }`}
                >
                  {/* Goal info + stepper */}
                  <div className="flex items-center gap-3.5 p-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        todayCount > 0
                          ? "bg-accent-500 text-white shadow-sm shadow-accent-500/30"
                          : "bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-400"
                      }`}
                    >
                      <Icon name={goal.iconName} className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-base font-semibold ${
                          todayCount > 0
                            ? "text-accent-700 dark:text-accent-300"
                            : "text-secondary-700 dark:text-secondary-300"
                        }`}
                      >
                        {title}
                      </span>
                    </div>
                    {/* +/- stepper — bigger */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          !isFuture &&
                          handleSetMonthlyGoalCount(goal.id, todayCount - 1)
                        }
                        disabled={isFuture || todayCount <= 0}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary-100 text-secondary-600 transition-colors hover:bg-secondary-200 disabled:opacity-30 dark:bg-secondary-700 dark:text-secondary-300 dark:hover:bg-secondary-600"
                      >
                        <Icon name="minus" className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-lg font-black text-secondary-900 dark:text-white">
                        {todayCount}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          !isFuture &&
                          handleSetMonthlyGoalCount(goal.id, todayCount + 1)
                        }
                        disabled={isFuture}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-100 text-accent-600 transition-colors hover:bg-accent-200 disabled:opacity-30 dark:bg-accent-900/30 dark:text-accent-400 dark:hover:bg-accent-800/40"
                      >
                        <Icon name="plus" className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="border-t border-secondary-100 px-4 py-3 dark:border-secondary-700/50">
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-secondary-500">
                        {t("monthly.progress")}
                      </span>
                      <span
                        className={`font-bold ${exceeded ? "text-accent-600 dark:text-accent-400" : "text-secondary-600 dark:text-secondary-300"}`}
                      >
                        {totalProgress}/{goal.target} {t("monthly.times")}
                        {exceeded && (
                          <span className="ms-1 text-accent-500">
                            {t("monthly.exceeded")}
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-secondary-200 dark:bg-secondary-700">
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
                      <p className="mt-1.5 text-sm font-bold text-accent-600 dark:text-accent-400">
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
      <section className="mb-7">
        <h3 className="mb-3 flex items-center gap-2.5 text-sm font-bold uppercase tracking-wide text-secondary-600 dark:text-secondary-400">
          <Icon name="edit-3" className="h-5 w-5 text-primary-500" />
          {t("day.reflection_title")}
        </h3>
        <textarea
          value={entry.reflection || ""}
          onChange={(e) => handleReflection(e.target.value)}
          disabled={isFuture}
          placeholder={reflectionPrompt}
          rows={3}
          className="w-full resize-none rounded-2xl border-2 border-secondary-200 bg-white px-5 py-4 text-base text-secondary-900 placeholder-secondary-400 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-400/30 disabled:opacity-60 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white dark:placeholder-secondary-500"
        />
      </section>

      {/* ── Day summary ── */}
      <div className="rounded-2xl bg-primary-50/60 p-5 dark:bg-secondary-800/60">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-black text-primary-600 dark:text-primary-400">
              {stats.basicsDone}/{stats.basicsTotal}
            </p>
            <p className="text-sm font-medium text-secondary-500">
              {t("day.basics_title")}
            </p>
          </div>
          <div>
            <p className="text-xl font-black text-primary-600 dark:text-primary-400">
              {stats.dailyDone}/{stats.dailyTotal}
            </p>
            <p className="text-sm font-medium text-secondary-500">
              {t("day.daily_title")}
            </p>
          </div>
          <div>
            <p className="text-xl font-black text-accent-600 dark:text-accent-400">
              {stats.monthlyDone}
            </p>
            <p className="text-sm font-medium text-secondary-500">
              {t("day.monthly_title")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Warm Save Overlay ── */}
      <AnimatePresence>
        {showSaveOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="mx-6 max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl dark:bg-secondary-800"
            >
              <div className="mb-4 text-5xl font-black text-primary-500">
                {stats.percent}%
              </div>
              <p
                className="mb-2 text-xl font-black text-secondary-900 dark:text-white"
                style={{
                  fontFamily: isAr
                    ? "var(--font-arabic)"
                    : "var(--font-heading)",
                }}
              >
                {t("save_moment.title")}
              </p>
              <p className="text-base font-medium text-secondary-500 dark:text-secondary-400">
                {saveMessage}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save & Close Button — big, game-like ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => {
          // Pick a random affirming message
          const msgs = t("save_moment.messages");
          const msgArr = Array.isArray(msgs)
            ? msgs
            : [
                "Allah sees every small deed.",
                "Consistency is the real secret.",
              ];
          setSaveMessage(
            String(msgArr[Math.floor(Math.random() * msgArr.length)]),
          );
          setShowSaveOverlay(true);
          haptic("medium");
          playSound("complete");
          // After 2s, actually save and close
          setTimeout(() => {
            if (onSave) onSave();
            else onClose();
          }, 2000);
        }}
        className="mt-7 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary-500 to-emerald-500 px-6 py-4.5 text-lg font-black text-white shadow-lg transition-all hover:shadow-xl active:shadow-md"
        style={{
          fontFamily: isAr ? "var(--font-arabic)" : "var(--font-heading)",
          boxShadow:
            "0 5px 0 rgba(4,120,87,0.5), 0 8px 25px rgba(16,185,129,0.25)",
        }}
      >
        <Icon name="check" className="h-5 w-5" />
        {t("day.save_and_close")}
      </motion.button>
    </div>
  );
}
