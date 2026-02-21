// ============================================================
// Ramadan Companion — HexGrid (Spiritual Journey Path)
// A Duolingo-inspired winding path showing 30 Ramadan days
// as an engaging, game-like spiritual progress tracker.
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, HexDay, HexDayStatus } from "@/lib/app-types";
import { getDailyContent } from "@/lib/daily-content";
import { haptic, playSound } from "@/lib/feedback";
import { getDateString } from "@/lib/gallery";
import { Icon } from "@/lib/icons";
import {
  calculateStreak,
  ensureDayEntry,
  getCurrentRamadanDay,
  getDayStats,
  getHexGridData,
  isLastTenNights,
  isOddNight,
  loadState,
  saveState,
} from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InAppBanner } from "./InAppBanner";

// Lazy-load heavy components only needed on interaction or special state
const Confetti = lazy(() =>
  import("./Confetti").then((m) => ({ default: m.Confetti })),
);
const DayDetail = lazy(() =>
  import("./DayDetail").then((m) => ({ default: m.DayDetail })),
);
const EidCelebration = lazy(() =>
  import("./EidCelebration").then((m) => ({ default: m.EidCelebration })),
);

// ── Layout Constants ─────────────────────────────────────────

const CONTAINER_W = 300;
const CENTER_X = CONTAINER_W / 2;
const NODE_GAP = 68;
const WAVE_AMP = 48;
const WAVE_FREQ = 0.85;
const PHASE_SPACE = 48;
const TOP_OFFSET = 56;
const BOTTOM_PAD = 80;

const NODE_SIZE: Record<HexDayStatus, number> = {
  future: 38,
  today: 56,
  "past-empty": 42,
  "past-partial": 44,
  "past-good": 44,
  "past-perfect": 48,
};

// ── Position Model ───────────────────────────────────────────

interface NodePos {
  x: number;
  y: number;
  hex: HexDay;
}

function calculateLayout(hexData: HexDay[]): {
  positions: NodePos[];
  totalH: number;
} {
  const positions: NodePos[] = [];
  let y = TOP_OFFSET;

  for (let i = 0; i < hexData.length; i++) {
    // Extra vertical space at phase boundaries (days 1, 11, 21)
    if (i === 0 || i === 10 || i === 20) y += PHASE_SPACE;
    const x = CENTER_X + Math.sin(i * WAVE_FREQ) * WAVE_AMP;
    positions.push({ x, y, hex: hexData[i] });
    y += NODE_GAP;
  }

  return { positions, totalH: y + BOTTOM_PAD };
}

// ── SVG Bezier Path Builder ──────────────────────────────────

function buildCurvePath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1];
    const c = pts[i];
    const dy = (c.y - p.y) * 0.4;
    d += ` C ${p.x},${p.y + dy} ${c.x},${c.y - dy} ${c.x},${c.y}`;
  }
  return d;
}

// ── Progress Ring (completion %) ─────────────────────────────

function ProgressRing({
  percent,
  size,
  strokeW = 3,
}: {
  percent: number;
  size: number;
  strokeW?: number;
}) {
  const r = (size - strokeW * 2) / 2;
  const C = 2 * Math.PI * r;

  return (
    <svg
      width={size}
      height={size}
      className="absolute inset-0"
      style={{ transform: "rotate(-90deg)" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={strokeW}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="white"
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - percent / 100)}
        className="transition-[stroke-dashoffset] duration-1000 ease-out"
      />
    </svg>
  );
}

// ── Day Node (visual only — positioned by parent) ────────────

interface DayNodeProps {
  hex: HexDay;
  index: number;
  isSelected: boolean;
  onTap: (hex: HexDay) => void;
  todayPercent: number;
}

function DayNode({
  hex,
  index,
  isSelected,
  onTap,
  todayPercent,
}: DayNodeProps) {
  const clickable = hex.status !== "future";

  return (
    <div
      className="relative h-full w-full animate-[nodeEntry_0.4s_ease-out_both]"
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      {/* Pulsing glow — today */}
      {hex.status === "today" && (
        <div className="absolute -inset-2 rounded-full bg-emerald-400/20 animate-[pulse-glow_2.5s_ease-in-out_infinite]" />
      )}

      {/* Rotating shimmer ring — perfect */}
      {hex.status === "past-perfect" && (
        <div
          className="absolute -inset-1.5 rounded-full animate-[spin_4s_linear_infinite]"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(245,158,11,0.45), rgba(245,158,11,0), rgba(245,158,11,0.45))",
          }}
        />
      )}

      {/* Main circle button */}
      <button
        type="button"
        onClick={() => clickable && onTap(hex)}
        disabled={!clickable}
        className={nodeClasses(hex.status, isSelected, clickable)}
        style={nodeInlineStyle(hex.status)}
      >
        {/* Progress ring for today */}
        {hex.status === "today" && todayPercent > 0 && (
          <ProgressRing percent={todayPercent} size={NODE_SIZE[hex.status]} />
        )}

        {/* Day number */}
        <span
          className={`relative z-10 leading-none ${
            hex.status === "today"
              ? "text-base font-bold"
              : "text-sm font-semibold"
          }`}
        >
          {hex.day}
        </span>
      </button>

      {/* Completed badge */}
      {(hex.status === "past-good" || hex.status === "past-perfect") && (
        <div
          className={`absolute -bottom-1 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border animate-[nodeEntry_0.3s_ease-out_both] ${
            hex.status === "past-perfect"
              ? "border-amber-300/60 bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm shadow-amber-400/50"
              : "border-emerald-300/60 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm shadow-emerald-500/40"
          }`}
          style={{ animationDelay: `${index * 0.02 + 0.3}s` }}
        >
          <Icon
            name="check"
            className="h-2.5 w-2.5 text-white drop-shadow-sm"
          />
        </div>
      )}

      {/* Partial progress dot */}
      {hex.status === "past-partial" && (
        <div
          className="absolute -bottom-0.5 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-[nodeEntry_0.3s_ease-out_both]"
          style={{ animationDelay: `${index * 0.02 + 0.3}s` }}
        />
      )}

      {/* Star — perfect day */}
      {hex.status === "past-perfect" && (
        <span
          className="absolute -top-2 -right-1 text-xs text-amber-400 animate-[nodeEntry_0.3s_ease-out_both]"
          style={{ animationDelay: `${index * 0.02 + 0.4}s` }}
        >
          ★
        </span>
      )}

      {/* Milestone badge — Day 15 (halfway), 27 (Laylatul Qadr), 30 (finish) */}
      {(hex.day === 15 || hex.day === 27 || hex.day === 30) &&
        hex.status !== "future" && (
          <div
            className="absolute -top-2.5 -left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm animate-[nodeEntry_0.3s_ease-out_both]"
            style={{ animationDelay: `${index * 0.02 + 0.5}s` }}
          >
            <span className="text-[8px] text-white">
              {hex.day === 15 ? "½" : hex.day === 27 ? "✦" : "🏁"}
            </span>
          </div>
        )}
    </div>
  );
}

// CSS classes per status
function nodeClasses(
  status: HexDayStatus,
  selected: boolean,
  clickable: boolean,
): string {
  const base =
    "relative flex h-full w-full items-center justify-center rounded-full transition-transform active:scale-95";
  const ring = selected
    ? "ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-stone-900"
    : "";
  const cursor = clickable ? "cursor-pointer" : "cursor-default opacity-60";

  const v: Record<HexDayStatus, string> = {
    future:
      "border-2 border-dashed border-stone-300 bg-stone-100 text-stone-400 dark:border-stone-600 dark:bg-stone-800/40 dark:text-stone-500",
    today:
      "border-2 border-emerald-300 text-white shadow-lg shadow-emerald-500/40",
    "past-empty":
      "border border-white/60 bg-white/50 text-secondary-400 shadow-sm backdrop-blur-sm dark:border-secondary-600/40 dark:bg-secondary-800/50 dark:text-secondary-500",
    "past-partial":
      "border border-emerald-200/70 bg-emerald-50/70 text-emerald-700 shadow-sm backdrop-blur-sm dark:border-emerald-700/50 dark:bg-emerald-900/30 dark:text-emerald-300",
    "past-good":
      "border border-emerald-300/60 bg-emerald-500 text-white shadow-md shadow-emerald-500/30 backdrop-blur-sm dark:bg-emerald-600",
    "past-perfect":
      "border border-amber-200/60 text-white shadow-lg shadow-amber-400/40 backdrop-blur-sm",
  };

  return `${base} ${v[status] || ""} ${ring} ${cursor}`;
}

// Inline styles for gradients
function nodeInlineStyle(status: HexDayStatus) {
  if (status === "today")
    return { background: "linear-gradient(135deg, #10b981, #059669)" };
  if (status === "past-perfect")
    return { background: "linear-gradient(135deg, #fbbf24, #f59e0b, #fcd34d)" };
  if (status === "past-good")
    return { background: "linear-gradient(135deg, #10b981, #34d399)" };
  return {};
}

// ── Phase Milestone Banner ───────────────────────────────────

function PhaseBanner({
  phase,
  y,
  t,
}: {
  phase: "mercy" | "forgiveness" | "freedom";
  y: number;
  t: (k: string) => string;
}) {
  const cfg = {
    mercy: {
      label: t("today.phase_first"),
      icon: "heart" as const,
      bg: "from-emerald-50 to-emerald-100/60 dark:from-emerald-950/50 dark:to-emerald-900/20",
      border: "border-emerald-200/80 dark:border-emerald-800/60",
      iconCls: "text-emerald-600 dark:text-emerald-400",
      textCls: "text-emerald-800 dark:text-emerald-300",
    },
    forgiveness: {
      label: t("today.phase_middle"),
      icon: "refresh-cw" as const,
      bg: "from-amber-50 to-amber-100/60 dark:from-amber-950/50 dark:to-amber-900/20",
      border: "border-amber-200/80 dark:border-amber-800/60",
      iconCls: "text-amber-600 dark:text-amber-400",
      textCls: "text-amber-800 dark:text-amber-300",
    },
    freedom: {
      label: t("today.phase_last"),
      icon: "flame" as const,
      bg: "from-rose-50 to-rose-100/60 dark:from-rose-950/50 dark:to-rose-900/20",
      border: "border-rose-200/80 dark:border-rose-800/60",
      iconCls: "text-rose-600 dark:text-rose-400",
      textCls: "text-rose-800 dark:text-rose-300",
    },
  }[phase];

  return (
    <div
      className="absolute left-0 right-0 flex justify-center animate-[fadeSlideUp_0.5s_ease-out_0.2s_both]"
      style={{ top: y - 56 }}
    >
      <div
        className={`flex items-center gap-2 rounded-full border bg-linear-to-r px-4 py-1.5 ${cfg.bg} ${cfg.border}`}
      >
        <Icon name={cfg.icon} className={`h-3.5 w-3.5 ${cfg.iconCls}`} />
        <span
          className={`text-[11px] font-bold uppercase tracking-wide ${cfg.textCls}`}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

// ── Decorative Scatter ───────────────────────────────────────

function Decorations({ totalH }: { totalH: number }) {
  const items = useMemo(
    () =>
      [
        { x: "8%", y: 140, icon: "moon" as const, cls: "h-4 w-4", o: 0.09 },
        { x: "88%", y: 340, icon: "star" as const, cls: "h-3 w-3", o: 0.07 },
        {
          x: "6%",
          y: 560,
          icon: "sparkles" as const,
          cls: "h-3.5 w-3.5",
          o: 0.06,
        },
        { x: "92%", y: 780, icon: "moon" as const, cls: "h-3 w-3", o: 0.08 },
        {
          x: "10%",
          y: 1000,
          icon: "star" as const,
          cls: "h-3.5 w-3.5",
          o: 0.07,
        },
        {
          x: "90%",
          y: 1250,
          icon: "sparkles" as const,
          cls: "h-3 w-3",
          o: 0.06,
        },
        {
          x: "7%",
          y: 1500,
          icon: "moon" as const,
          cls: "h-3.5 w-3.5",
          o: 0.08,
        },
        { x: "91%", y: 1750, icon: "star" as const, cls: "h-3 w-3", o: 0.07 },
        {
          x: "9%",
          y: 1950,
          icon: "sparkles" as const,
          cls: "h-3.5 w-3.5",
          o: 0.06,
        },
      ].filter((d) => d.y < totalH),
    [totalH],
  );

  return (
    <>
      {items.map((d, i) => (
        <div
          key={`deco-${d.y}`}
          className="pointer-events-none absolute text-primary-400 dark:text-primary-600 animate-[float_5s_ease-in-out_infinite]"
          style={{
            left: d.x,
            top: d.y,
            opacity: d.o,
            animationDuration: `${5 + i * 0.7}s`,
          }}
        >
          <Icon name={d.icon} className={d.cls} />
        </div>
      ))}
    </>
  );
}

// ── Main HexGrid Component ───────────────────────────────────

interface HexGridProps {
  locale: AppLocale;
}

export function HexGrid({ locale }: HexGridProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";
  const [state, setState] = useState(() => loadState());
  const [selectedHex, setSelectedHex] = useState<HexDay | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);

  const persist = useCallback((next: typeof state) => {
    setState(next);
    saveState(next);
  }, []);

  const hexData = useMemo(() => getHexGridData(state), [state]);
  const currentDay = getCurrentRamadanDay(state);
  const streak = calculateStreak(state);
  const todayStats = getDayStats(state, getDateString());
  const dailyContent = useMemo(() => getDailyContent(currentDay), [currentDay]);

  // Detect 100% completion for confetti
  const prevPercent = useRef(todayStats.percent);
  useEffect(() => {
    if (todayStats.percent === 100 && prevPercent.current < 100) {
      setShowConfetti(true);
      playSound("celebrate");
      haptic("heavy");
      setTimeout(() => setShowConfetti(false), 3000);
    }
    prevPercent.current = todayStats.percent;
  }, [todayStats.percent]);

  const { positions, totalH } = useMemo(
    () => calculateLayout(hexData),
    [hexData],
  );

  // Two-part SVG path: completed (emerald) + future (dashed grey)
  const todayIdx = hexData.findIndex((h) => h.status === "today");
  const splitAt =
    todayIdx >= 0
      ? todayIdx
      : hexData.filter((h) => h.status.startsWith("past")).length;

  const completedPath = useMemo(
    () => (splitAt > 0 ? buildCurvePath(positions.slice(0, splitAt + 1)) : ""),
    [positions, splitAt],
  );
  const futurePath = useMemo(
    () =>
      splitAt < positions.length - 1
        ? buildCurvePath(positions.slice(splitAt))
        : "",
    [positions, splitAt],
  );

  // Phase milestone positions
  const milestones = useMemo(() => {
    const ms: { phase: "mercy" | "forgiveness" | "freedom"; y: number }[] = [];
    if (positions.length > 0) ms.push({ phase: "mercy", y: positions[0].y });
    if (positions.length > 10)
      ms.push({ phase: "forgiveness", y: positions[10].y });
    if (positions.length > 20)
      ms.push({ phase: "freedom", y: positions[20].y });
    return ms;
  }, [positions]);

  // Auto-scroll to today's node on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      todayRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleTap = useCallback(
    (hex: HexDay) => {
      haptic("light");
      const withEntry = ensureDayEntry(state, hex.date);
      if (withEntry !== state) persist(withEntry);
      setSelectedHex(hex);
    },
    [state, persist],
  );

  const isLaylatalQadr = isLastTenNights(currentDay);
  const isTonightOdd = isOddNight(currentDay);

  // Show Eid celebration when Ramadan is over
  if (currentDay > 30) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <p>🎉</p>
          </div>
        }
      >
        <EidCelebration locale={locale} state={state} />
      </Suspense>
    );
  }

  return (
    <div
      data-hydrated="true"
      className={`flex min-h-screen flex-col ${
        isLaylatalQadr
          ? "bg-gradient-to-b from-indigo-950/30 via-purple-50/40 to-indigo-50/30 dark:from-indigo-950 dark:via-purple-950 dark:to-indigo-950"
          : "bg-gradient-to-b from-primary-50/40 via-secondary-50 to-accent-50/30 dark:from-secondary-950 dark:via-secondary-950 dark:to-secondary-950"
      }`}
    >
      {/* ── Header ─────────────────────────────────── */}
      <header className="z-10 border-b border-primary-100/50 bg-white/60 px-5 pt-14 pb-3 backdrop-blur-md dark:border-secondary-800 dark:bg-secondary-950/80">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-bold tracking-tight text-secondary-900 dark:text-white"
              style={{
                fontFamily: isRTL
                  ? "var(--font-arabic)"
                  : "var(--font-heading)",
              }}
            >
              {t("site.name")}
            </h1>
            <p className="text-xs text-secondary-500">
              {t("today.day_label")} {currentDay} {t("today.of_ramadan")}
            </p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 dark:bg-accent-900/30 animate-[nodeEntry_0.3s_ease-out_both]">
              <Icon name="flame" className="h-3.5 w-3.5 text-accent-600" />
              <span className="text-xs font-bold text-accent-700 dark:text-accent-400">
                {streak}
              </span>
            </div>
          )}
        </div>

        {/* Quick stats row */}
        <div className="mt-3 flex gap-2">
          {[
            {
              label: t("hex.basics_done"),
              value: `${todayStats.basicsDone}/${todayStats.basicsTotal}`,
              accent: false,
            },
            {
              label: t("hex.daily_done"),
              value: `${todayStats.dailyDone}/${todayStats.dailyTotal}`,
              accent: false,
            },
            {
              label: t("hex.completion"),
              value: `${todayStats.percent}%`,
              accent: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl bg-white/70 p-2.5 dark:bg-secondary-900/60"
            >
              <p className="text-[10px] text-secondary-500">{s.label}</p>
              <p
                className={`font-heading text-lg font-bold leading-tight ${
                  s.accent
                    ? "text-accent-600 dark:text-accent-400"
                    : "text-primary-600 dark:text-primary-400"
                }`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Daily Verse Card */}
        <div className="mt-3 rounded-2xl bg-gradient-to-r from-primary-50 to-accent-50/60 p-3 dark:from-primary-950/40 dark:to-accent-950/30 animate-[fadeSlideUp_0.4s_ease-out_0.3s_both]">
          <p
            className="text-center text-xs leading-relaxed text-secondary-700 dark:text-secondary-300"
            style={{
              fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-sans)",
            }}
          >
            "{isRTL ? dailyContent.verse.ar : dailyContent.verse.en}"
          </p>
          <p className="mt-1 text-center text-[10px] text-secondary-400">
            — {dailyContent.verse.ref}
          </p>
        </div>

        {/* Laylatul Qadr Banner */}
        {isLaylatalQadr && (
          <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 shadow-lg shadow-purple-600/20 animate-[nodeEntry_0.4s_ease-out_both]">
            <span className="text-sm">✦</span>
            <span className="text-xs font-bold text-white">
              {t("laylatul_qadr.banner")}
            </span>
            {isTonightOdd && (
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white">
                {t("laylatul_qadr.odd_night")}
              </span>
            )}
          </div>
        )}

        {/* Smart contextual banner */}
        <InAppBanner locale={locale} state={state} />
      </header>

      {/* ── Journey Path ───────────────────────────── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28">
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: CONTAINER_W, maxWidth: "100%", height: totalH }}
        >
          {/* Decorative elements */}
          <Decorations totalH={totalH} />

          {/* SVG connecting path */}
          <svg
            className="pointer-events-none absolute left-0 top-0"
            style={{ width: CONTAINER_W, maxWidth: "100%", height: totalH }}
            viewBox={`0 0 ${CONTAINER_W} ${totalH}`}
            aria-hidden="true"
          >
            <defs>
              <filter id="pathGlow">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Completed trail (emerald glow) */}
            {completedPath && (
              <path
                d={completedPath}
                fill="none"
                stroke="rgba(16,185,129,0.35)"
                strokeWidth={3}
                strokeLinecap="round"
                filter="url(#pathGlow)"
                className="animate-[drawPath_1.8s_ease-out_both]"
                style={
                  {
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    pathLength: 1,
                  } as React.CSSProperties
                }
              />
            )}

            {/* Future trail (dashed grey) */}
            {futurePath && (
              <path
                d={futurePath}
                fill="none"
                stroke="rgba(168,158,148,0.18)"
                strokeWidth={2}
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Phase milestone banners */}
          {milestones.map(({ phase, y }) => (
            <PhaseBanner key={phase} phase={phase} y={y} t={t} />
          ))}

          {/* Day nodes */}
          {positions.map(({ hex, x, y }, i) => {
            const size = NODE_SIZE[hex.status] ?? 42;
            const half = size / 2;
            return (
              <div
                key={hex.day}
                ref={hex.status === "today" ? todayRef : undefined}
                className="absolute"
                style={{
                  left: x - half,
                  top: y - half,
                  width: size,
                  height: size,
                }}
              >
                <DayNode
                  hex={hex}
                  index={i}
                  isSelected={selectedHex?.day === hex.day}
                  onTap={handleTap}
                  todayPercent={hex.status === "today" ? todayStats.percent : 0}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Floating CTA ───────────────────────────── */}
      <div className="pointer-events-none fixed bottom-20 left-0 right-0 z-20 flex justify-center px-4">
        <button
          type="button"
          onClick={() => {
            const h = hexData.find((d) => d.status === "today");
            if (h) handleTap(h);
          }}
          className="pointer-events-auto flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-primary-600/30 transition-colors hover:bg-primary-700 active:scale-95"
          style={{
            fontFamily: isRTL ? "var(--font-arabic)" : "var(--font-heading)",
          }}
        >
          <Icon name="sparkles" className="h-4 w-4" />
          {t("hex.open_today")}
        </button>
      </div>

      {/* ── Day Detail Sheet ───────────────────────── */}
      <AnimatePresence>
        {selectedHex && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedHex(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Sheet */}
            <motion.div
              className="relative mt-auto max-h-[92vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:bg-secondary-900"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
            >
              {/* Drag handle */}
              <div className="sticky top-0 z-10 flex justify-center bg-white/80 pb-1 pt-3 backdrop-blur-sm dark:bg-secondary-900/80">
                <div className="h-1 w-10 rounded-full bg-secondary-300 dark:bg-secondary-600" />
              </div>
              <Suspense
                fallback={
                  <div className="p-8 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary-300 border-t-primary-600" />
                  </div>
                }
              >
                <DayDetail
                  locale={locale}
                  date={selectedHex.date}
                  state={state}
                  onStateChange={persist}
                  onClose={() => setSelectedHex(null)}
                  onSave={() => {
                    setSelectedHex(null);
                    setShowConfetti(true);
                    playSound("celebrate");
                    haptic("heavy");
                    setTimeout(() => setShowConfetti(false), 3000);
                  }}
                />
              </Suspense>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Confetti Celebration ────────────────────── */}
      <Suspense fallback={null}>
        <Confetti active={showConfetti} />
      </Suspense>
    </div>
  );
}
