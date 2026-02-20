// ============================================================
// Ramadan Companion — Onboarding Flow Component
// AI-powered: Assessment → AI Plan → Review/Adjust → Ready
// ============================================================

import { createTranslator } from "@/i18n/client";
import { Icon } from "@/lib/icons";
import { DEFAULT_CUSTOM_CONFIG, generatePlan } from "@/lib/plan-engine";
import type {
  CustomPathConfig,
  OnboardingData,
  PathLevel,
  WorshipCategory,
} from "@/lib/ramadan-types";
import { savePlan, setLocale } from "@/lib/storage";
import { navigateTo } from "@/utils/navigate";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { AIPlanReview, type AIPlanRecommendation } from "./AIPlanReview";
import { Assessment, type AssessmentAnswers } from "./Assessment";
import { CategorySelector } from "./CategorySelector";
import { CustomPlanConfig } from "./CustomPlanConfig";
import { PathSelector } from "./PathSelector";

type Step =
  | "mode"
  | "assessment"
  | "ai-loading"
  | "ai-review"
  | "path"
  | "customize"
  | "categories"
  | "ready";

interface OnboardingFlowProps {
  locale: "en" | "ar";
}

export function OnboardingFlow({ locale }: OnboardingFlowProps) {
  const t = createTranslator(locale);
  const [step, setStep] = useState<Step>("mode");
  const [selectedPath, setSelectedPath] = useState<PathLevel | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<
    WorshipCategory[]
  >(["fasting", "quran", "prayer", "dua"]);
  const [customConfig, setCustomConfig] = useState<CustomPathConfig>({
    ...DEFAULT_CUSTOM_CONFIG,
  });
  const [aiRecommendation, setAiRecommendation] =
    useState<AIPlanRecommendation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const isRTL = locale === "ar";

  // ── AI flow handlers ─────────────────────────────────────

  const handleAssessmentComplete = useCallback(
    async (answers: AssessmentAnswers) => {
      setStep("ai-loading");
      setAiError(null);

      try {
        const response = await fetch("/api/ai/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...answers, locale }),
        });

        if (!response.ok) throw new Error("Failed to generate plan");

        const recommendation: AIPlanRecommendation = await response.json();
        setAiRecommendation(recommendation);
        setCustomConfig(recommendation.config);
        setSelectedCategories(recommendation.categories);
        setSelectedPath(recommendation.path);
        setStep("ai-review");
      } catch {
        setAiError(
          locale === "ar"
            ? "تعذر إنشاء الخطة. يمكنك المتابعة يدوياً."
            : "Couldn't generate plan. You can continue manually.",
        );
        setStep("path");
      }
    },
    [locale],
  );

  const handleAIAccept = useCallback(() => {
    setStep("ready");
  }, []);

  const handleAIConfigChange = useCallback(
    (config: CustomPathConfig, categories: WorshipCategory[]) => {
      setCustomConfig(config);
      setSelectedCategories(categories);
    },
    [],
  );

  // ── Manual flow handlers ─────────────────────────────────

  const handleToggleCategory = useCallback((cat: WorshipCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const handleStartJourney = useCallback(() => {
    if (!selectedPath) return;

    const dailyMinutes =
      selectedPath === "custom" || aiRecommendation
        ? customConfig.dailyMinutes
        : selectedPath === "gentle"
          ? 15
          : selectedPath === "steady"
            ? 35
            : 75;

    const data: OnboardingData = {
      locale,
      path: selectedPath,
      categories: selectedCategories,
      dailyMinutes,
      ...(selectedPath === "custom" || aiRecommendation
        ? { customConfig }
        : {}),
    };

    const plan = generatePlan(data);
    savePlan(plan);
    setLocale(locale);

    navigateTo(`/${locale}/app/today`);
  }, [
    selectedPath,
    selectedCategories,
    locale,
    customConfig,
    aiRecommendation,
  ]);

  // ── Navigation ───────────────────────────────────────────

  const canProceed = () => {
    switch (step) {
      case "mode":
        return true;
      case "assessment":
        return false; // auto-advances
      case "ai-loading":
        return false;
      case "ai-review":
        return true;
      case "path":
        return selectedPath !== null;
      case "customize":
        return true;
      case "categories":
        return selectedCategories.length >= 2;
      case "ready":
        return true;
    }
  };

  const goNext = () => {
    if (step === "ai-review") setStep("ready");
    else if (step === "path")
      setStep(selectedPath === "custom" ? "customize" : "categories");
    else if (step === "customize") setStep("categories");
    else if (step === "categories") setStep("ready");
  };

  const goBack = () => {
    if (step === "assessment") setStep("mode");
    else if (step === "ai-review") setStep("mode");
    else if (step === "path") setStep("mode");
    else if (step === "customize") setStep("path");
    else if (step === "categories") {
      if (aiRecommendation) setStep("ai-review");
      else setStep(selectedPath === "custom" ? "customize" : "path");
    } else if (step === "ready") {
      if (aiRecommendation) setStep("ai-review");
      else setStep("categories");
    }
  };

  // ── Step index for progress ──────────────────────────────

  const getSteps = () => {
    if (step === "mode") return ["mode"];
    if (["assessment", "ai-loading", "ai-review"].includes(step)) {
      return ["mode", "assessment", "ai-review", "ready"];
    }
    // Manual flow
    if (selectedPath === "custom") {
      return ["mode", "path", "customize", "categories", "ready"];
    }
    return ["mode", "path", "categories", "ready"];
  };

  const steps = getSteps();
  const stepIndex = steps.indexOf(step === "ai-loading" ? "assessment" : step);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (isRTL ? -300 : 300) : isRTL ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? (isRTL ? -300 : 300) : isRTL ? 300 : -300,
      opacity: 0,
    }),
  };

  // ── Computed display values ──────────────────────────────

  const displayMinutes =
    selectedPath === "custom" || aiRecommendation
      ? customConfig.dailyMinutes
      : selectedPath === "gentle"
        ? 15
        : selectedPath === "steady"
          ? 35
          : 75;

  // ── Render ───────────────────────────────────────────────

  return (
    <div
      className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Progress dots */}
      {step !== "mode" && (
        <div className="mb-8 flex items-center justify-center gap-2">
          {steps.slice(1).map((s, i) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 <= stepIndex
                  ? "w-8 bg-primary-500"
                  : "w-2 bg-neutral-300 dark:bg-neutral-600"
              }`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        <AnimatePresence mode="wait" custom={1}>
          {/* ── Mode selection: AI or Manual ──────────────── */}
          {step === "mode" && (
            <motion.div
              key="mode"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="mb-4 text-5xl"
                >
                  <Icon name="moon" className="h-12 w-12 text-primary-500" />
                </motion.div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("onboarding.welcome")}
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {t("onboarding.welcome_sub")}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* AI option */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => setStep("assessment")}
                  className="group relative overflow-hidden rounded-2xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 text-start transition-all hover:border-primary-400 hover:shadow-lg dark:border-primary-800 dark:from-primary-950/30 dark:to-neutral-900"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center text-primary-500">
                      <Icon name="sparkles" className="h-7 w-7" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {t("onboarding.ai_mode")}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {t("onboarding.ai_mode_sub")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400">
                    <span>{t("onboarding.ai_mode_tag")}</span>
                  </div>
                </motion.button>

                {/* Manual option */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => setStep("path")}
                  className="group rounded-2xl border-2 border-neutral-200 bg-white p-6 text-start transition-all hover:border-neutral-400 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800/50"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-8 w-8 items-center justify-center text-neutral-600 dark:text-neutral-400">
                      <Icon name="wrench" className="h-7 w-7" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {t("onboarding.manual_mode")}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {t("onboarding.manual_mode_sub")}
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ── Assessment quiz ──────────────────────────── */}
          {step === "assessment" && (
            <motion.div
              key="assessment"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <Assessment
                onComplete={handleAssessmentComplete}
                t={t}
                locale={locale}
              />
            </motion.div>
          )}

          {/* ── AI loading state ─────────────────────────── */}
          {step === "ai-loading" && (
            <motion.div
              key="ai-loading"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-6 text-5xl"
              >
                <Icon name="sparkles" className="h-12 w-12 text-primary-500" />
              </motion.div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                {t("ai_review.generating")}
              </h2>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {t("ai_review.generating_sub")}
              </p>
            </motion.div>
          )}

          {/* ── AI plan review ───────────────────────────── */}
          {step === "ai-review" && aiRecommendation && (
            <motion.div
              key="ai-review"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("ai_review.title")}
                </h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {t("ai_review.subtitle")}
                </p>
              </div>

              <AIPlanReview
                recommendation={aiRecommendation}
                onAccept={handleAIAccept}
                onConfigChange={handleAIConfigChange}
                t={t}
                locale={locale}
              />
            </motion.div>
          )}

          {/* ── Manual: path selection ───────────────────── */}
          {step === "path" && (
            <motion.div
              key="path"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("onboarding.choose_path")}
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {t("onboarding.choose_path_sub")}
                </p>
              </div>

              {aiError && (
                <div className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  {aiError}
                </div>
              )}

              <PathSelector
                selected={selectedPath}
                onSelect={setSelectedPath}
                locale={locale}
                t={t}
              />
            </motion.div>
          )}

          {/* ── Manual: custom config ────────────────────── */}
          {step === "customize" && (
            <motion.div
              key="customize"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("onboarding.customize")}
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {t("onboarding.customize_sub")}
                </p>
              </div>

              <CustomPlanConfig
                config={customConfig}
                onChange={setCustomConfig}
                t={t}
              />
            </motion.div>
          )}

          {/* ── Categories selection ─────────────────────── */}
          {step === "categories" && (
            <motion.div
              key="categories"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {t("onboarding.choose_categories")}
                </h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                  {t("onboarding.choose_categories_sub")}
                </p>
              </div>

              <CategorySelector
                selected={selectedCategories}
                onToggle={handleToggleCategory}
                t={t}
              />
            </motion.div>
          )}

          {/* ── Ready / Summary ──────────────────────────── */}
          {step === "ready" && (
            <motion.div
              key="ready"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="mb-6 text-7xl"
              >
                <Icon name="moon" className="h-16 w-16 text-primary-500" />
              </motion.div>

              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {t("onboarding.ready")}
              </h1>
              <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                {t("onboarding.ready_sub")}
              </p>

              {/* Plan summary */}
              <div className="mt-8 w-full rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {t("onboarding.choose_path")}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {selectedPath && t(`paths.${selectedPath}.name`)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {t("onboarding.choose_categories")}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {selectedCategories.length}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-neutral-500">
                    {t("ai_review.estimated_time")}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-white">
                    ~{displayMinutes} {t("units.minutes")}/
                    {t("custom_config.day")}
                  </span>
                </div>
                {aiRecommendation && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                    <Icon name="sparkles" className="h-3.5 w-3.5" />
                    <span>{t("ai_review.ai_personalized")}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom nav */}
      <div className="mt-8 flex gap-3">
        {step !== "mode" && step !== "ai-loading" && step !== "assessment" && (
          <button
            onClick={goBack}
            className="rounded-xl border border-neutral-300 px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {t("onboarding.back")}
          </button>
        )}

        {step !== "mode" && step !== "ai-loading" && step !== "assessment" && (
          <button
            onClick={step === "ready" ? handleStartJourney : goNext}
            disabled={!canProceed()}
            className={`flex-1 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all ${
              canProceed()
                ? "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/25"
                : "cursor-not-allowed bg-neutral-300 dark:bg-neutral-700"
            }`}
          >
            {step === "ready"
              ? t("onboarding.start_journey")
              : step === "ai-review"
                ? t("ai_review.looks_good")
                : t("onboarding.next")}
          </button>
        )}
      </div>
    </div>
  );
}
