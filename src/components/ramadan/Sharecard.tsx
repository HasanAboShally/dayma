// ============================================================
// Ramadan Companion — Social Sharecard (Canvas API → PNG)
// Generates a beautiful share image of daily/overall progress
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale, AppState } from "@/lib/app-types";
import { getDateString } from "@/lib/gallery";
import { Icon } from "@/lib/icons";
import {
  calculateStreak,
  getCurrentRamadanDay,
  getDayStats,
} from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

interface SharecardProps {
  locale: AppLocale;
  state: AppState;
  dayNumber?: number; // if provided, shows day-specific card
}

const CARD_W = 540;
const CARD_H = 340;

function drawSharecard(
  canvas: HTMLCanvasElement,
  state: AppState,
  t: (key: string) => string,
  dayNumber: number,
  isRTL: boolean,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = CARD_W * 2; // retina
  canvas.height = CARD_H * 2;
  ctx.scale(2, 2);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, "#064e3b"); // emerald-900
  bg.addColorStop(0.5, "#065f46"); // emerald-800
  bg.addColorStop(1, "#047857"); // emerald-700
  ctx.fillStyle = bg;
  roundRect(ctx, 0, 0, CARD_W, CARD_H, 24);
  ctx.fill();

  // Decorative circles
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(CARD_W - 60, 60, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(80, CARD_H - 40, 80, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stars decoration
  ctx.fillStyle = "rgba(251,191,36,0.3)";
  const stars = [
    [CARD_W - 40, 30, 5],
    [CARD_W - 90, 55, 3],
    [60, 45, 4],
    [CARD_W - 130, 25, 3],
  ];
  for (const [sx, sy, sr] of stars) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Moon
  ctx.fillStyle = "rgba(251,191,36,0.15)";
  ctx.beginPath();
  ctx.arc(CARD_W - 70, 70, 35, 0, Math.PI * 2);
  ctx.fill();

  const todayStats = getDayStats(state, getDateString());
  const streak = calculateStreak(state);
  const pct = todayStats.percent;

  // Day label
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 14px 'Outfit', system-ui, sans-serif";
  ctx.textAlign = isRTL ? "right" : "left";
  ctx.fillText(
    `${t("today.day_label")} ${dayNumber} ${t("today.of_ramadan")}`,
    isRTL ? CARD_W - 36 : 36,
    50,
  );

  // App name
  ctx.fillStyle = "#fff";
  ctx.font = "700 28px 'Outfit', system-ui, sans-serif";
  ctx.fillText(t("site.name"), isRTL ? CARD_W - 36 : 36, 85);

  // Progress circle
  const cx = CARD_W / 2;
  const cy = 190;
  const r = 55;

  // Track
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  // Progress arc
  ctx.strokeStyle = pct >= 90 ? "#fbbf24" : "#34d399";
  ctx.lineWidth = 8;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * pct) / 100);
  ctx.stroke();

  // Percent text
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "800 32px 'Outfit', system-ui, sans-serif";
  ctx.fillText(`${pct}%`, cx, cy + 10);

  // Streak badge
  if (streak > 0) {
    const sx2 = cx;
    const sy2 = cy + r + 28;
    ctx.fillStyle = "rgba(251,191,36,0.2)";
    roundRect(ctx, sx2 - 45, sy2 - 14, 90, 28, 14);
    ctx.fill();
    ctx.fillStyle = "#fbbf24";
    ctx.font = "700 13px 'Outfit', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`🔥 ${streak} ${t("progress.days_unit")}`, sx2, sy2 + 4);
  }

  // Footer branding
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.textAlign = "center";
  ctx.font = "400 11px 'Outfit', system-ui, sans-serif";
  ctx.fillText("dayma.hasanat.dev", CARD_W / 2, CARD_H - 20);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function Sharecard({ locale, state, dayNumber }: SharecardProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCard, setShowCard] = useState(false);
  const [_copied, _setCopied] = useState(false);
  const day = dayNumber ?? getCurrentRamadanDay(state);
  const todayStats = getDayStats(state, getDateString());

  // Only show share button for 100% days or when explicitly passed
  const canShare = todayStats.percent >= 100 || dayNumber !== undefined;

  const generateAndShare = useCallback(async () => {
    if (!canvasRef.current) return;
    drawSharecard(canvasRef.current, state, t, day, isRTL);
    setShowCard(true);

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvasRef.current!.toBlob(resolve, "image/png"),
      );
      if (!blob) return;

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [
            new File([blob], "ramadan-progress.png", { type: "image/png" }),
          ],
        })
      ) {
        const file = new File([blob], "ramadan-progress.png", {
          type: "image/png",
        });
        await navigator.share({
          title: t("site.name"),
          text: `${t("today.day_label")} ${day} ${t("today.of_ramadan")} — ${todayStats.percent}%`,
          files: [file],
        });
      }
    } catch {
      // Sharing cancelled or unsupported — that's ok, card is visible
    }
  }, [state, t, day, isRTL, todayStats.percent]);

  const downloadImage = useCallback(() => {
    if (!canvasRef.current) return;
    drawSharecard(canvasRef.current, state, t, day, isRTL);
    const link = document.createElement("a");
    link.download = `ramadan-day-${day}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }, [state, t, day, isRTL]);

  if (!canShare) return null;

  return (
    <>
      {/* Share trigger button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={generateAndShare}
        className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-500 to-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg"
      >
        <Icon name="share" className="h-3.5 w-3.5" />
        {t("share.button")}
      </motion.button>

      {/* Hidden canvas for rendering */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width={CARD_W * 2}
        height={CARD_H * 2}
      />

      {/* Card preview overlay */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
            onClick={() => setShowCard(false)}
          >
            <motion.div
              initial={{ scale: 0.85, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-4"
            >
              <canvas
                ref={(el) => {
                  if (el) {
                    drawSharecard(el, state, t, day, isRTL);
                  }
                }}
                width={CARD_W * 2}
                height={CARD_H * 2}
                className="w-full max-w-sm rounded-2xl shadow-2xl"
                style={{ imageRendering: "auto" }}
              />
              <div className="flex gap-3">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-secondary-900 shadow-lg transition-colors hover:bg-secondary-100"
                >
                  <Icon name="download" className="h-4 w-4" />
                  {t("share.download")}
                </button>
                <button
                  onClick={() => setShowCard(false)}
                  className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
                >
                  {t("common.close")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
