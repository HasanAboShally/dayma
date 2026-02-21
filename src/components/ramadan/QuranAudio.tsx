// ============================================================
// Ramadan Companion — Quran Audio Player
// Minimal audio player for daily verse recitation.
// Uses EveryAyah.com CDN for Quran audio (public, free).
// ============================================================

import { createTranslator } from "@/i18n/client";
import { trackEvent, AnalyticsEvents } from "@/lib/analytics";
import type { AppLocale } from "@/lib/app-types";
import { Icon } from "@/lib/icons";
import { useCallback, useEffect, useRef, useState } from "react";

interface QuranAudioProps {
  locale: AppLocale;
  /** Quran reference like "2:255" (Surah:Ayah) */
  verseRef: string;
}

// Map common surah:ayah refs to audio file path
// EveryAyah format: https://everyayah.com/data/{reciter}/{surah}{ayah}.mp3
// surah is 3 digits, ayah is 3 digits
const RECITER = "Abdul_Basit_Murattal_64kbps"; // Clear, well-known reciter

function getAudioUrl(ref: string): string | null {
  // Parse "2:255" or "Quran 2:255" format
  const match = ref.match(/(\d+):(\d+)/);
  if (!match) return null;

  const surah = match[1].padStart(3, "0");
  const ayah = match[2].padStart(3, "0");

  return `https://everyayah.com/data/${RECITER}/${surah}${ayah}.mp3`;
}

export function QuranAudio({ locale, verseRef }: QuranAudioProps) {
  const t = createTranslator(locale);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const audioUrl = getAudioUrl(verseRef);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioUrl) return;

    if (playing && audioRef.current) {
      audioRef.current.pause();
      setPlaying(false);
      trackEvent(AnalyticsEvents.QURAN_AUDIO_PAUSED, { verse: verseRef });
      return;
    }

    setLoading(true);
    setError(false);

    if (!audioRef.current) {
      const audio = new Audio(audioUrl);
      audio.preload = "auto";

      audio.addEventListener("canplaythrough", () => {
        setLoading(false);
        audio.play().catch(() => setError(true));
        setPlaying(true);
      });

      audio.addEventListener("ended", () => {
        setPlaying(false);
      });

      audio.addEventListener("error", () => {
        setLoading(false);
        setError(true);
        setPlaying(false);
      });

      audioRef.current = audio;
      audio.load();
    } else {
      setLoading(false);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setError(true));
      setPlaying(true);
    }

    trackEvent(AnalyticsEvents.QURAN_AUDIO_PLAYED, { verse: verseRef });
  }, [audioUrl, playing, verseRef]);

  if (!audioUrl) return null;

  return (
    <button
      type="button"
      onClick={togglePlay}
      disabled={loading}
      aria-label={
        playing ? t("audio.pause") : loading ? t("audio.loading") : t("audio.play")
      }
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-all ${
        playing
          ? "bg-primary-500 text-white shadow-sm shadow-primary-500/30"
          : error
            ? "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400"
            : "bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-800/40"
      } ${loading ? "animate-pulse" : ""}`}
    >
      {loading ? (
        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : playing ? (
        <Icon name="pause" className="h-3.5 w-3.5" />
      ) : (
        <Icon name="play" className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
