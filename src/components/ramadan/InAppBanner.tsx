// ============================================================
// Ramadan Companion — Smart In-App Banner
// Contextual, spiritually-aware messages based on time/state
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, AppState } from "@/lib/app-types";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import { getDateString } from "@/lib/gallery";
import { Icon } from "@/lib/icons";
import { getPrayerWindows } from "@/lib/prayer-times";
import {
  calculateStreak,
  getCurrentRamadanDay,
  getDayStats,
  isLastTenNights,
  isOddNight,
} from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BannerProps {
  locale: AppLocale;
  state: AppState;
}

type BannerType = {
  id: string;
  icon: string;
  message: string;
  bg: string;
  priority: number;
};

function getBanners(state: AppState, t: (key: string) => string): BannerType[] {
  const banners: BannerType[] = [];
  const now = new Date();
  const hour = now.getHours();
  const currentDay = getCurrentRamadanDay(state);
  const todayStats = getDayStats(state, getDateString());
  const streak = calculateStreak(state);

  // Use prayer-time-aware windows instead of hardcoded hours
  const prayerWindows = getPrayerWindows(now);

  // Suhoor reminder (based on calculated Fajr time)
  if (hour >= prayerWindows.suhoorStart && hour < prayerWindows.suhoorEnd) {
    banners.push({
      id: "suhoor",
      icon: "🌙",
      message: t("banner.suhoor"),
      bg: "from-indigo-600 to-purple-600",
      priority: 10,
    });
  }

  // Iftar time (based on calculated Maghrib time)
  if (hour >= prayerWindows.iftarStart && hour < prayerWindows.iftarEnd) {
    banners.push({
      id: "iftar",
      icon: "🌅",
      message: t("banner.iftar"),
      bg: "from-amber-500 to-orange-500",
      priority: 9,
    });
  }

  // Laylatul Qadr nights
  if (isLastTenNights(currentDay) && isOddNight(currentDay) && hour >= 20) {
    banners.push({
      id: "laylatul-qadr",
      icon: "✦",
      message: t("banner.laylatul_qadr"),
      bg: "from-purple-600 to-indigo-700",
      priority: 10,
    });
  }

  // Streak at risk (evening, haven't done much)
  if (hour >= 20 && todayStats.percent < 30 && streak > 2) {
    banners.push({
      id: "streak-risk",
      icon: "🔥",
      message: t("banner.streak_risk").replace("{streak}", String(streak)),
      bg: "from-red-500 to-orange-500",
      priority: 8,
    });
  }

  // Ramadan Mubarak (Day 1)
  if (currentDay === 1) {
    banners.push({
      id: "ramadan-mubarak",
      icon: "🌙",
      message: t("banner.ramadan_mubarak"),
      bg: "from-emerald-600 to-teal-600",
      priority: 7,
    });
  }

  // Streak celebration (milestones)
  if (streak === 7 || streak === 14 || streak === 21) {
    banners.push({
      id: "streak-celebrate",
      icon: "⭐",
      message: t("banner.streak_milestone").replace("{streak}", String(streak)),
      bg: "from-amber-500 to-yellow-500",
      priority: 6,
    });
  }

  // Halfway mark
  if (currentDay === 15) {
    banners.push({
      id: "halfway",
      icon: "🎯",
      message: t("banner.halfway"),
      bg: "from-primary-600 to-emerald-600",
      priority: 5,
    });
  }

  return banners.sort((a, b) => b.priority - a.priority);
}

export function InAppBanner({ locale, state }: BannerProps) {
  const t = createTranslator(locale);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = getBanners(state, t).filter((b) => !dismissed.has(b.id));
  const banner = banners[currentIndex % Math.max(1, banners.length)];

  // Rotate banners every 8 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((i) => i + 1);
    }, 8000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banner) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={banner.id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className={`relative mt-2 flex items-center gap-2.5 rounded-xl bg-gradient-to-r ${banner.bg} px-3.5 py-2.5 shadow-md`}
      >
        <span className="text-sm">{banner.icon}</span>
        <p className="flex-1 text-xs font-medium text-white">
          {banner.message}
        </p>
        <button
          onClick={() => {
            setDismissed((s) => new Set([...s, banner.id]));
            trackEvent(AnalyticsEvents.BANNER_DISMISSED, { banner: banner.id });
          }}
          className="rounded-lg p-1 text-white/60 transition-colors hover:text-white"
          aria-label={t("accessibility.dismissBanner")}
        >
          <Icon name="x" className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
