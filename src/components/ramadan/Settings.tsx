// ============================================================
// Ramadan Companion — Settings Page Component
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale } from "@/lib/app-types";
import { Icon } from "@/lib/icons";
import {
  disableReminder,
  enableReminder,
  isNotificationSupported,
  loadReminderPrefs,
} from "@/lib/notifications";
import {
  clearState,
  exportData,
  importData,
  loadState,
  saveState,
} from "@/lib/store";
import { navigateTo } from "@/utils/navigate";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface SettingsProps {
  locale: AppLocale;
}

export function Settings({ locale }: SettingsProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [reminderOn, setReminderOn] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const [supportsNotif, setSupportsNotif] = useState(true);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    // Load saved reminder preference
    setSupportsNotif(isNotificationSupported());
    setReminderOn(loadReminderPrefs().enabled);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDark]);

  const toggleReminder = useCallback(async () => {
    if (reminderOn) {
      disableReminder();
      setReminderOn(false);
      setReminderMsg(null);
    } else {
      const ok = await enableReminder();
      if (ok) {
        setReminderOn(true);
        setReminderMsg(t("settings.reminder_enabled"));
        setTimeout(() => setReminderMsg(null), 3000);
      } else {
        setReminderMsg(
          isNotificationSupported()
            ? t("settings.reminder_denied")
            : t("settings.reminder_unsupported"),
        );
      }
    }
  }, [reminderOn, t]);

  const handleReset = useCallback(() => {
    clearState();
    navigateTo(`/${locale}/`);
  }, [locale]);

  const handleExport = useCallback(() => {
    const currentState = loadState();
    const data = exportData(currentState);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dayma-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (re) => {
        const text = re.target?.result as string;
        const imported = importData(text);
        if (imported) {
          saveState(imported);
          setImportMessage(t("common.done"));
          setTimeout(() => window.location.reload(), 1000);
        } else {
          setImportMessage(t("common.error"));
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [t]);

  const [state] = useState(() => loadState());
  const hasData = state.setupComplete;

  return (
    <div
      data-hydrated="true"
      className="mx-auto min-h-screen max-w-lg px-4 pb-24 pt-14"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="mb-6 font-heading text-2xl font-bold text-secondary-900 dark:text-white">
        {t("settings.title")}
      </h1>

      <div className="space-y-4">
        {/* Language */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-secondary-900 dark:text-white">
              {t("settings.language")}
            </span>
            <div className="flex gap-2">
              <a
                href="/en/app/settings"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === "en"
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                }`}
              >
                English
              </a>
              <a
                href="/ar/app/settings"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  locale === "ar"
                    ? "bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300"
                    : "text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                }`}
              >
                العربية
              </a>
            </div>
          </div>
        </div>

        {/* Dark Mode Toggle */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon
                name={isDark ? "moon" : "sun"}
                className="h-5 w-5 text-primary-500"
              />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">
                {t("theme.toggle")}
              </span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                isDark ? "bg-primary-600" : "bg-secondary-300"
              }`}
              aria-label={t("accessibility.toggleTheme")}
            >
              <motion.div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
                animate={{ x: isRTL ? (isDark ? 2 : 22) : isDark ? 22 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>

        {/* Daily Reminder Toggle */}
        {supportsNotif && (
          <div className="rounded-xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="bell-ring" className="h-5 w-5 text-primary-500" />
                <div>
                  <span className="text-sm font-medium text-secondary-900 dark:text-white">
                    {t("settings.daily_reminder")}
                  </span>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {t("settings.daily_reminder_desc")}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleReminder}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  reminderOn ? "bg-primary-600" : "bg-secondary-300"
                }`}
                aria-label={t("settings.daily_reminder")}
              >
                <motion.div
                  className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm"
                  animate={{
                    x: isRTL ? (reminderOn ? 2 : 22) : reminderOn ? 22 : 2,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
            {reminderMsg && (
              <p className="mt-2 text-xs text-primary-600 dark:text-primary-400">
                {reminderMsg}
              </p>
            )}
          </div>
        )}

        {/* Manage Actions */}
        {hasData && (
          <a
            href={`/${locale}/app/setup`}
            className="flex items-center justify-between rounded-xl border border-secondary-200 bg-white p-4 transition-colors hover:bg-secondary-50 dark:border-secondary-700 dark:bg-secondary-800/50 dark:hover:bg-secondary-700/50"
          >
            <div className="flex items-center gap-3">
              <Icon name="list" className="h-5 w-5 text-primary-500" />
              <span className="text-sm font-medium text-secondary-900 dark:text-white">
                {t("settings.manage_actions")}
              </span>
            </div>
            <Icon
              name={isRTL ? "chevron-left" : "chevron-right"}
              className="h-4 w-4 text-secondary-400"
            />
          </a>
        )}

        {/* Data management */}
        {hasData && (
          <div className="rounded-xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/50">
            <div className="space-y-3">
              <button
                onClick={handleExport}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 transition-colors hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700/50"
              >
                <span>{t("settings.export_data")}</span>
                <Icon name="upload" className="h-5 w-5" />
              </button>

              <button
                onClick={handleImport}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-secondary-700 transition-colors hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700/50"
              >
                <span>{t("settings.import_data")}</span>
                <Icon name="download" className="h-5 w-5" />
              </button>

              {importMessage && (
                <p className="text-center text-xs text-primary-600">
                  {importMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Reset */}
        {hasData && (
          <div className="rounded-xl border border-red-200 bg-white p-4 dark:border-red-900/30 dark:bg-secondary-800/50">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full text-sm font-medium text-red-600 dark:text-red-400"
              >
                {t("settings.reset_plan")}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="mb-3 text-sm text-secondary-600 dark:text-secondary-400">
                  {t("settings.reset_confirm")}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 rounded-lg border border-secondary-300 px-4 py-2 text-sm text-secondary-700 dark:border-secondary-600 dark:text-secondary-300"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    {t("common.confirm")}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* About */}
        <div className="rounded-xl border border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-800/50">
          <h3 className="mb-2 text-sm font-medium text-secondary-900 dark:text-white">
            {t("settings.about")}
          </h3>
          <p className="text-sm text-secondary-600 dark:text-secondary-400">
            {t("settings.about_text")}
          </p>
          <p className="mt-3 text-xs text-secondary-400">
            {t("footer.privacy")}
          </p>
        </div>
      </div>
    </div>
  );
}
