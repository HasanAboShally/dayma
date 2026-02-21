import ar from "./ar.json";
import en from "./en.json";

// Supported locales
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

// Default locale
export const defaultLocale: Locale = "ar";

// RTL locales
export const rtlLocales: Locale[] = ["ar"];

// Locale configurations
export const localeConfig: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    dir: "ltr" | "rtl";
    flag: string;
  }
> = {
  en: {
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇺🇸",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
    flag: "🇸🇦",
  },
};

// Translations object
const translations: Record<Locale, typeof en> = {
  en,
  ar,
};

/**
 * Get locale from URL path
 */
export function getLangFromUrl(url: URL): Locale {
  const [, lang] = url.pathname.split("/");
  if (locales.includes(lang as Locale)) {
    return lang as Locale;
  }
  return defaultLocale;
}

/**
 * Get text direction for a locale
 */
export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

/**
 * Get translations for a locale
 */
export function useTranslations(locale: Locale) {
  return function t(key: string): string {
    const keys = key.split(".");
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to default locale
        value = translations[defaultLocale];
        for (const fallbackKey of keys) {
          if (value && typeof value === "object" && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if translation not found
          }
        }
        break;
      }
    }

    return typeof value === "string" ? value : key;
  };
}

/**
 * Get translated path for locale switching
 */
export function getTranslatedPath(
  pathname: string,
  targetLocale: Locale,
): string {
  const segments = pathname.split("/").filter(Boolean);

  // Remove current locale if present
  if (locales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  // Add target locale
  return (
    `/${targetLocale}/${segments.join("/")}`.replace(/\/$/, "") ||
    `/${targetLocale}`
  );
}

/**
 * Get all locale paths for a given path (useful for generating alternate links)
 */
export function getAllLocalePaths(pathname: string): Record<Locale, string> {
  const result: Partial<Record<Locale, string>> = {};

  for (const locale of locales) {
    result[locale] = getTranslatedPath(pathname, locale);
  }

  return result as Record<Locale, string>;
}

/**
 * Format number based on locale
 */
export function formatNumber(num: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US").format(num);
}

/**
 * Format date based on locale
 */
export function formatDate(
  date: Date,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(date);
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US", {
    style: "currency",
    currency,
  }).format(amount);
}
