// ============================================================
// Ramadan Companion — Eid Celebration Screen
// "Your Ramadan in Numbers" summary when currentDay > 30
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, AppState } from "@/lib/app-types";
import { addDays } from "@/lib/gallery";
import {
  calculateStreak,
  getDayStats,
  getLongestStreak,
  getTotalCompleted,
} from "@/lib/store";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Confetti } from "./Confetti";

interface EidCelebrationProps {
  locale: AppLocale;
  state: AppState;
}

export function EidCelebration({ locale, state }: EidCelebrationProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";

  // Compute Ramadan summary stats
  const summary = useMemo(() => {
    let perfectDays = 0;
    let totalPercent = 0;
    let basicsTotal = 0;
    let basicsDone = 0;
    let dailyTotal = 0;
    let dailyDone = 0;
    let monthlyDone = 0;

    for (let i = 0; i < 30; i++) {
      const date = addDays(state.ramadanStartDate, i);
      const s = getDayStats(state, date);
      totalPercent += s.percent;
      basicsTotal += s.basicsTotal;
      basicsDone += s.basicsDone;
      dailyTotal += s.dailyTotal;
      dailyDone += s.dailyDone;
      monthlyDone += s.monthlyDone;
      if (s.percent >= 90 && state.days[date]) perfectDays++;
    }

    return {
      avgPercent: Math.round(totalPercent / 30),
      perfectDays,
      totalCompleted: getTotalCompleted(state),
      longestStreak: getLongestStreak(state),
      finalStreak: calculateStreak(state),
      basicsRate:
        basicsTotal > 0 ? Math.round((basicsDone / basicsTotal) * 100) : 100,
      dailyRate:
        dailyTotal > 0 ? Math.round((dailyDone / dailyTotal) * 100) : 0,
      monthlyDone,
    };
  }, [state]);

  const stats = [
    {
      icon: "🌟",
      label: t("eid.avg_completion"),
      value: `${summary.avgPercent}%`,
    },
    {
      icon: "⭐",
      label: t("eid.perfect_days"),
      value: `${summary.perfectDays}`,
    },
    {
      icon: "🔥",
      label: t("eid.longest_streak"),
      value: `${summary.longestStreak}`,
    },
    {
      icon: "✅",
      label: t("eid.total_completed"),
      value: `${summary.totalCompleted}`,
    },
    {
      icon: "🕌",
      label: t("eid.prayer_rate"),
      value: `${summary.basicsRate}%`,
    },
    { icon: "📖", label: t("eid.daily_rate"), value: `${summary.dailyRate}%` },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-b from-emerald-50 via-amber-50/30 to-emerald-50 px-6 pb-24 pt-16 dark:from-emerald-950 dark:via-amber-950/20 dark:to-emerald-950"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Confetti burst */}
      <Confetti active duration={5000} />

      {/* Decorative circles */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-800/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-800/10" />

      {/* Moon & stars */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6 text-6xl"
      >
        🌙
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-2 font-heading text-3xl font-bold text-secondary-900 dark:text-white"
      >
        {t("eid.title")}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8 text-center text-sm text-secondary-600 dark:text-secondary-400"
      >
        {t("eid.subtitle")}
      </motion.p>

      {/* Your Ramadan in Numbers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-sm"
      >
        <h2 className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-secondary-500">
          {t("eid.in_numbers")}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 1 + i * 0.1,
                type: "spring",
                stiffness: 200,
              }}
              className="flex flex-col items-center rounded-2xl border border-secondary-200 bg-white/80 p-4 backdrop-blur-sm dark:border-secondary-700 dark:bg-secondary-800/50"
            >
              <span className="text-2xl">{stat.icon}</span>
              <span className="mt-1 text-2xl font-bold text-secondary-900 dark:text-white">
                {stat.value}
              </span>
              <span className="mt-0.5 text-center text-[10px] text-secondary-500">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Spiritual closing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="mt-8 max-w-sm rounded-2xl bg-gradient-to-r from-emerald-100/80 to-amber-100/50 p-5 dark:from-emerald-900/30 dark:to-amber-900/20"
      >
        <p className="text-center text-sm leading-relaxed text-secondary-700 dark:text-secondary-300">
          {t("eid.closing_verse")}
        </p>
        <p className="mt-2 text-center text-xs text-secondary-400">
          {t("eid.closing_ref")}
        </p>
      </motion.div>

      {/* Eid greeting */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="mt-6 font-heading text-lg font-bold text-primary-700 dark:text-primary-400"
      >
        {t("eid.greeting")}
      </motion.p>
    </div>
  );
}
