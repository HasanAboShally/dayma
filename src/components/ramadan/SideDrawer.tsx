// ============================================================
// Ramadan Companion — Side Drawer Navigation
// Replaces BottomNav with a hamburger-triggered slide-out menu
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale } from "@/lib/app-types";
import { Icon, type IconName } from "@/lib/icons";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

interface NavItem {
  href: string;
  icon: IconName;
  labelKey: string;
}

interface SideDrawerProps {
  locale: AppLocale;
  currentPath: string;
}

export function SideDrawer({ locale, currentPath }: SideDrawerProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";
  const [open, setOpen] = useState(false);

  const items: NavItem[] = [
    { href: `/${locale}/app/today`, icon: "nav-today", labelKey: "nav.today" },
    {
      href: `/${locale}/app/progress`,
      icon: "nav-progress",
      labelKey: "nav.progress",
    },
    {
      href: `/${locale}/app/setup`,
      icon: "settings-2",
      labelKey: "nav.plan",
    },
    {
      href: `/${locale}/app/settings`,
      icon: "nav-settings",
      labelKey: "nav.settings",
    },
  ];

  const isActive = (href: string) => {
    const cleanCurrent = currentPath.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");
    return cleanCurrent === cleanHref;
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", handler);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((p) => !p), []);

  // Slide direction depends on RTL
  const slideFrom = isRTL ? { x: "100%" } : { x: "-100%" };
  const slideTo = { x: 0 };

  return (
    <>
      {/* ── Top Bar: Big hamburger, no centered title (header has its own) ── */}
      <div className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center px-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={t("accessibility.openMenu")}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 shadow-lg shadow-primary-900/10 backdrop-blur-lg transition-transform hover:scale-105 active:scale-90 dark:bg-secondary-800/90"
        >
          <Icon
            name={open ? "close" : "menu"}
            className="h-6 w-6 text-secondary-700 dark:text-secondary-200"
          />
        </button>
      </div>

      {/* ── Drawer Overlay + Panel ── */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[65] bg-black/30 backdrop-blur-sm"
            />

            {/* Drawer panel */}
            <motion.nav
              initial={slideFrom}
              animate={slideTo}
              exit={slideFrom}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              dir={isRTL ? "rtl" : "ltr"}
              className="fixed inset-y-0 start-0 z-[70] flex w-80 flex-col bg-gradient-to-b from-primary-50 via-white to-accent-50/30 shadow-2xl dark:from-secondary-900 dark:via-secondary-900 dark:to-secondary-950"
            >
              {/* Header */}
              <div className="flex items-center gap-3.5 border-b border-secondary-100 px-5 pb-5 pt-7 dark:border-secondary-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/30">
                  <Icon name="moon-star" className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-heading text-lg font-black text-secondary-900 dark:text-white">
                    {t("site.name")}
                  </p>
                  <p className="text-xs font-medium text-secondary-500">
                    {t("site.tagline")}
                  </p>
                </div>
              </div>

              {/* Nav Items — bigger touch targets */}
              <div className="flex-1 space-y-1.5 px-3 pt-5">
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`relative flex items-center gap-3.5 rounded-2xl px-4 py-4 text-base font-semibold transition-all ${
                        active
                          ? "bg-primary-500/10 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
                          : "text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-white"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="drawer-active"
                          className="absolute inset-y-1 start-0 w-1.5 rounded-full bg-primary-500"
                          transition={{ type: "spring", duration: 0.4 }}
                        />
                      )}
                      <Icon
                        name={item.icon}
                        className={`h-6 w-6 ${active ? "text-primary-500" : ""}`}
                      />
                      <span>{t(item.labelKey)}</span>
                    </a>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="border-t border-secondary-100 px-5 py-5 dark:border-secondary-800">
                <div className="flex flex-wrap gap-4 text-xs font-medium text-secondary-500 dark:text-secondary-400">
                  <a
                    href={`/${locale}/privacy`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {t("footer.privacy_link")}
                  </a>
                  <a
                    href={`/${locale}/terms`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {t("footer.terms_link")}
                  </a>
                  <a
                    href={`/${locale}/about`}
                    className="hover:text-primary-600 transition-colors"
                  >
                    {t("footer.about_link")}
                  </a>
                </div>
                <p className="mt-2 text-xs text-secondary-400 dark:text-secondary-500">
                  {t("footer.privacy")}
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
