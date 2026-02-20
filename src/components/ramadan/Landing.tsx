// ============================================================
// Ramadan Companion — Landing Page (Bold Redesign)
// ============================================================

import { createTranslator } from "@/i18n/client";
import type { AppLocale } from "@/lib/app-types";
import { Icon } from "@/lib/icons";
import { loadState } from "@/lib/store";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LandingProps {
  locale: AppLocale;
}

export function Landing({ locale }: LandingProps) {
  const t = createTranslator(locale);
  const isRTL = locale === "ar";

  // Default to /setup so prerendered HTML matches the initial client render.
  // After hydration, check localStorage and switch to /today if setup is done.
  const defaultHref = `/${locale}/app/setup`;
  const [ctaHref, setCtaHref] = useState(defaultHref);

  useEffect(() => {
    const state = loadState();
    if (state.setupComplete) {
      setCtaHref(`/${locale}/app/today`);
    }
  }, [locale]);

  return (
    <div
      data-hydrated="true"
      className="min-h-screen bg-secondary-50 dark:bg-secondary-950"
    >
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pb-16 pt-20">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 end-[-80px] h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute bottom-0 start-[-60px] h-48 w-48 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-md text-center">
          {/* Hex icon cluster */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center justify-center"
          >
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-500/30">
                <svg
                  viewBox="0 0 40 40"
                  className="h-10 w-10 text-white"
                  fill="currentColor"
                >
                  <path
                    d="M20 2L36 11.5V29L20 38L4 29V11.5L20 2Z"
                    opacity="0.3"
                  />
                  <path d="M20 6L32 13.5V27L20 34L8 27V13.5L20 6Z" />
                </svg>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 rounded-[1.75rem] border border-dashed border-primary-300/50 dark:border-primary-700/50"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-secondary-900 dark:text-white sm:text-5xl"
          >
            {t("landing.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-secondary-600 dark:text-secondary-400"
          >
            {t("landing.subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          >
            <a
              href={ctaHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 font-heading text-lg font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700 hover:shadow-xl sm:w-auto"
            >
              {t("landing.cta")}
              <Icon
                name={isRTL ? "arrow-left" : "arrow-right"}
                className="h-5 w-5"
              />
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-4 text-xs text-secondary-400"
          >
            {t("landing.no_signup")}
          </motion.p>
        </div>
      </section>

      {/* ── Three Layers Preview ── */}
      <section className="px-5 pb-16">
        <div className="mx-auto max-w-md space-y-4">
          {[
            {
              icon: "shield-check" as const,
              title: t("landing.layer1_title"),
              desc: t("landing.layer1_desc"),
              color: "primary",
              bgClass: "bg-primary-50 dark:bg-primary-950/30",
              iconBg: "bg-primary-100 dark:bg-primary-900/50",
              iconColor: "text-primary-600",
            },
            {
              icon: "target" as const,
              title: t("landing.layer2_title"),
              desc: t("landing.layer2_desc"),
              color: "emerald",
              bgClass: "bg-white dark:bg-secondary-900",
              iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
              iconColor: "text-emerald-600",
            },
            {
              icon: "trophy" as const,
              title: t("landing.layer3_title"),
              desc: t("landing.layer3_desc"),
              color: "accent",
              bgClass: "bg-accent-50/50 dark:bg-accent-950/20",
              iconBg: "bg-accent-100 dark:bg-accent-900/50",
              iconColor: "text-accent-600",
            },
          ].map((layer, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex items-start gap-4 rounded-2xl p-5 ${layer.bgClass}`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${layer.iconBg}`}
              >
                <Icon
                  name={layer.icon}
                  className={`h-5 w-5 ${layer.iconColor}`}
                />
              </div>
              <div>
                <h3 className="font-heading text-base font-semibold text-secondary-900 dark:text-white">
                  {layer.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-secondary-600 dark:text-secondary-400">
                  {layer.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Hex Grid Preview ── */}
      <section className="bg-white px-5 py-16 dark:bg-secondary-900">
        <div className="mx-auto max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-2xl font-bold text-secondary-900 dark:text-white">
              {t("landing.hex_title")}
            </h2>
            <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
              {t("landing.hex_desc")}
            </p>
          </motion.div>

          {/* Mini hex preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <svg viewBox="0 0 280 120" className="mx-auto w-64">
              {Array.from({ length: 12 }).map((_, i) => {
                const col = i % 6;
                const row = Math.floor(i / 6);
                const r = 18;
                const w = r * Math.sqrt(3);
                const offset = row % 2 === 1 ? w / 2 + 2 : 0;
                const cx = col * (w + 4) + r + 10 + offset;
                const cy = row * (r * 1.5 + 4) + r + 10;
                const opacity = [
                  0.2, 0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.9, 0.4, 0.6, 0.3, 0.5,
                ][i];
                const pts: string[] = [];
                for (let j = 0; j < 6; j++) {
                  const a = (Math.PI / 3) * j - Math.PI / 6;
                  pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`);
                }
                return (
                  <polygon
                    key={i}
                    points={pts.join(" ")}
                    fill={`rgba(16,185,129,${opacity})`}
                    stroke="rgba(16,185,129,0.3)"
                    strokeWidth={1}
                  />
                );
              })}
            </svg>
          </motion.div>
        </div>
      </section>

      {/* ── Spiritual Quote ── */}
      <section className="px-5 py-16">
        <div className="mx-auto max-w-md">
          <motion.blockquote
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-primary-100 bg-primary-50/50 p-6 text-center dark:border-primary-900/30 dark:bg-primary-950/20"
          >
            <p className="font-heading text-base italic leading-relaxed text-secondary-700 dark:text-secondary-300">
              {t("landing.spiritual_note")}
            </p>
            <cite className="mt-3 block text-sm font-medium text-primary-600 not-italic dark:text-primary-400">
              — {t("landing.spiritual_attribution")}
            </cite>
          </motion.blockquote>
        </div>
      </section>

      {/* ── Footer CTA ── */}
      <section className="px-5 pb-6">
        <div className="mx-auto max-w-md text-center">
          <a
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-8 py-4 font-heading text-lg font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:bg-primary-700"
          >
            {t("landing.cta")}
            <Icon
              name={isRTL ? "arrow-left" : "arrow-right"}
              className="h-5 w-5"
            />
          </a>
          <p className="mt-4 text-xs text-secondary-400">
            {t("landing.pwa_note")}
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-secondary-200 px-5 pb-8 pt-6 dark:border-secondary-800">
        <div className="mx-auto max-w-md text-center">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-secondary-400">
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
          <p className="mt-3 text-[10px] text-secondary-400">
            {t("footer.copyright")}
          </p>
          <p className="mt-1 text-[10px] text-secondary-400">
            {t("footer.privacy")}
          </p>
        </div>
      </footer>
    </div>
  );
}
