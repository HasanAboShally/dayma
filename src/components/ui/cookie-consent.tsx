import { cn } from "@/utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ConsentType = "all" | "necessary" | null;

interface CookieConsentProps {
  locale: "en" | "ar";
  onConsent?: (type: ConsentType) => void;
}

const translations = {
  en: {
    title: "We value your privacy",
    description:
      'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
    acceptAll: "Accept All",
    acceptNecessary: "Necessary Only",
    customize: "Customize",
    learnMore: "Learn more",
    privacyPolicy: "Privacy Policy",
    save: "Save Preferences",
    categories: {
      necessary: {
        title: "Necessary",
        description:
          "Essential for the website to function properly. Cannot be disabled.",
      },
      analytics: {
        title: "Analytics",
        description:
          "Help us understand how visitors interact with our website.",
      },
      marketing: {
        title: "Marketing",
        description:
          "Used to track visitors across websites for advertising purposes.",
      },
    },
  },
  ar: {
    title: "نحن نقدر خصوصيتك",
    description:
      'نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح وتقديم محتوى مخصص وتحليل حركة المرور. بالنقر على "قبول الكل"، فإنك توافق على استخدامنا لملفات تعريف الارتباط.',
    acceptAll: "قبول الكل",
    acceptNecessary: "الضرورية فقط",
    customize: "تخصيص",
    learnMore: "اعرف المزيد",
    privacyPolicy: "سياسة الخصوصية",
    save: "حفظ التفضيلات",
    categories: {
      necessary: {
        title: "ضرورية",
        description: "ضرورية لعمل الموقع بشكل صحيح. لا يمكن تعطيلها.",
      },
      analytics: {
        title: "تحليلية",
        description: "تساعدنا على فهم كيفية تفاعل الزوار مع موقعنا.",
      },
      marketing: {
        title: "تسويقية",
        description: "تستخدم لتتبع الزوار عبر المواقع لأغراض إعلانية.",
      },
    },
  },
};

const CONSENT_KEY = "cookie-consent";
const CONSENT_PREFERENCES_KEY = "cookie-preferences";

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

function getStoredConsent(): ConsentType {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_KEY) as ConsentType;
}

function getStoredPreferences(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(CONSENT_PREFERENCES_KEY);
  return stored ? JSON.parse(stored) : null;
}

function storeConsent(type: ConsentType, preferences: ConsentPreferences) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, type || "");
  localStorage.setItem(CONSENT_PREFERENCES_KEY, JSON.stringify(preferences));
}

// Export for use in analytics
export function hasAnalyticsConsent(): boolean {
  const preferences = getStoredPreferences();
  return preferences?.analytics ?? false;
}

export function hasMarketingConsent(): boolean {
  const preferences = getStoredPreferences();
  return preferences?.marketing ?? false;
}

export function CookieConsent({ locale, onConsent }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  });

  const t = translations[locale];
  const isRTL = locale === "ar";

  useEffect(() => {
    // Check if user has already made a choice
    const existingConsent = getStoredConsent();
    if (!existingConsent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
    // Load existing preferences
    const existingPrefs = getStoredPreferences();
    if (existingPrefs) {
      setPreferences(existingPrefs);
    }
    return undefined;
  }, []);

  const handleAcceptAll = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    };
    storeConsent("all", newPreferences);
    setPreferences(newPreferences);
    setIsVisible(false);
    onConsent?.("all");

    // Trigger analytics load
    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: newPreferences }),
    );
  };

  const handleAcceptNecessary = () => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    };
    storeConsent("necessary", newPreferences);
    setPreferences(newPreferences);
    setIsVisible(false);
    onConsent?.("necessary");

    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: newPreferences }),
    );
  };

  const handleSavePreferences = () => {
    const consentType =
      preferences.analytics || preferences.marketing ? "all" : "necessary";
    storeConsent(consentType, { ...preferences, timestamp: Date.now() });
    setIsVisible(false);
    setShowCustomize(false);
    onConsent?.(consentType);

    window.dispatchEvent(
      new CustomEvent("cookie-consent", { detail: preferences }),
    );
  };

  const togglePreference = (
    key: keyof Omit<ConsentPreferences, "necessary" | "timestamp">,
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6",
            "border-t border-secondary-200 bg-white shadow-2xl dark:border-secondary-700 dark:bg-secondary-900",
          )}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <div className="mx-auto max-w-6xl">
            {!showCustomize ? (
              // Main consent banner
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                    {t.description}{" "}
                    <a
                      href={`/${locale}/legal/privacy`}
                      className="text-primary-600 hover:underline"
                    >
                      {t.privacyPolicy}
                    </a>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowCustomize(true)}
                    className="btn btn-ghost text-sm"
                  >
                    {t.customize}
                  </button>
                  <button
                    onClick={handleAcceptNecessary}
                    className="btn btn-secondary text-sm"
                  >
                    {t.acceptNecessary}
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="btn btn-primary text-sm"
                  >
                    {t.acceptAll}
                  </button>
                </div>
              </div>
            ) : (
              // Customize preferences view
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white">
                    {t.customize}
                  </h3>
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
                    aria-label="Close"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Necessary - Always on */}
                  <div className="flex items-center justify-between rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {t.categories.necessary.title}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {t.categories.necessary.description}
                      </p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled
                        className="h-5 w-5 cursor-not-allowed rounded border-secondary-300 text-primary-600 opacity-60 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  {/* Analytics */}
                  <div className="flex items-center justify-between rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {t.categories.analytics.title}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {t.categories.analytics.description}
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={preferences.analytics}
                      onClick={() => togglePreference("analytics")}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        preferences.analytics
                          ? "bg-primary-600"
                          : "bg-secondary-300 dark:bg-secondary-600",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          preferences.analytics
                            ? isRTL
                              ? "-translate-x-6"
                              : "translate-x-6"
                            : isRTL
                              ? "-translate-x-1"
                              : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between rounded-lg bg-secondary-50 p-3 dark:bg-secondary-800">
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {t.categories.marketing.title}
                      </p>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {t.categories.marketing.description}
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={preferences.marketing}
                      onClick={() => togglePreference("marketing")}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                        preferences.marketing
                          ? "bg-primary-600"
                          : "bg-secondary-300 dark:bg-secondary-600",
                      )}
                    >
                      <span
                        className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          preferences.marketing
                            ? isRTL
                              ? "-translate-x-6"
                              : "translate-x-6"
                            : isRTL
                              ? "-translate-x-1"
                              : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setShowCustomize(false)}
                    className="btn btn-ghost text-sm"
                  >
                    {t.acceptNecessary}
                  </button>
                  <button
                    onClick={handleSavePreferences}
                    className="btn btn-primary text-sm"
                  >
                    {t.save}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility to open cookie settings (for footer link)
export function openCookieSettings() {
  localStorage.removeItem(CONSENT_KEY);
  window.location.reload();
}

export default CookieConsent;
