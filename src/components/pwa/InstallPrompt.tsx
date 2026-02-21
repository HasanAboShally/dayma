// ============================================================
// PWA Install Prompt — Native-feeling install banner
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale } from "@/lib/app-types";
import { useCallback, useEffect, useState } from "react";

interface InstallPromptProps {
  locale: AppLocale;
}

// Detect iOS (Safari doesn't fire beforeinstallprompt)
function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

// Check if running in standalone mode (already installed)
function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as any).standalone === true
  );
}

const DISMISSED_KEY = "dayma_install_dismissed";
const DISMISS_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function InstallPrompt({ locale }: InstallPromptProps) {
  const t = createTranslator(locale);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return;

    // Don't show if dismissed recently
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) {
      const ts = parseInt(dismissed, 10);
      if (Date.now() - ts < DISMISS_EXPIRY_MS) return;
      localStorage.removeItem(DISMISSED_KEY);
    }

    // iOS: show custom instructions after a short delay
    if (isIOS()) {
      const timer = setTimeout(() => setShowIOSGuide(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android/Desktop: catch beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after a short delay (don't interrupt immediately)
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Also listen for successful install
    window.addEventListener("appinstalled", () => {
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    setInstalling(true);

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
    } catch {
      // User dismissed or error
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  }, []);

  // ── iOS Guide ──────────────────────────────────────────────
  if (showIOSGuide) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_0.4s_ease-out_both] p-4 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-primary-200 bg-white/95 p-4 shadow-xl backdrop-blur-lg dark:border-primary-800 dark:bg-secondary-900/95">
          {/* App icon */}
          <img
            src="/icons/icon-72x72.png"
            alt="Dayma"
            className="h-12 w-12 shrink-0 rounded-xl"
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-secondary-900 dark:text-white">
              {t("install.title")}
            </p>
            <p className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">
              {t("install.ios").replace("{shareIcon}", "⎋")}
            </p>
          </div>

          <button
            onClick={handleDismiss}
            className="shrink-0 rounded-full p-1.5 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-secondary-600 dark:hover:bg-secondary-800"
            aria-label={t("install.dismiss")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ── Android/Desktop Banner ─────────────────────────────────
  if (!showBanner) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-[slideUp_0.4s_ease-out_both] p-4 pb-[env(safe-area-inset-bottom,16px)]">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-primary-200 bg-white/95 p-4 shadow-xl backdrop-blur-lg dark:border-primary-800 dark:bg-secondary-900/95">
        {/* App icon */}
        <img
          src="/icons/icon-72x72.png"
          alt="Dayma"
          className="h-12 w-12 shrink-0 rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-secondary-900 dark:text-white">
            {t("install.title")}
          </p>
          <p className="mt-0.5 text-xs text-secondary-500 dark:text-secondary-400">
            {t("install.desc")}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-secondary-500 transition-colors hover:bg-secondary-100 dark:text-secondary-400 dark:hover:bg-secondary-800"
          >
            {t("install.dismiss")}
          </button>
          <button
            onClick={handleInstall}
            disabled={installing}
            className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-700 active:scale-95 disabled:opacity-60"
          >
            {installing ? "..." : t("install.button")}
          </button>
        </div>
      </div>
    </div>
  );
}
