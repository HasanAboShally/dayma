// ============================================================
// Client-side i18n utility for React components
// ============================================================

import ar from "./ar.json";
import en from "./en.json";

type Locale = "en" | "ar";

const translations: Record<Locale, typeof en> = { en, ar };

/**
 * Create a translation function for client-side React usage.
 * Mirrors the server-side useTranslations() API.
 */
export function createTranslator(locale: Locale) {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key;
          }
        }
        break;
      }
    }

    return typeof value === "string" ? value : key;
  };
}
