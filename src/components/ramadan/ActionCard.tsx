// ============================================================
// Ramadan Companion — ActionCard Component
// Reusable checkable worship action card for the daily checklist
// ============================================================

import type { DailyHabit } from "@/lib/app-types";
import type { IconName } from "@/lib/icons";
import { Icon } from "@/lib/icons";
import { motion } from "framer-motion";

// ── Category → default icon mapping ─────────────────────────

const CATEGORY_ICONS: Record<DailyHabit["category"], IconName> = {
  prayer: "prayer",
  quran: "quran",
  dhikr: "dhikr",
  charity: "charity",
  dua: "dua",
  fasting: "fasting",
  learning: "learning",
};

// ── Props ────────────────────────────────────────────────────

interface ActionCardProps {
  /** The daily habit to display */
  action: DailyHabit;
  /** Whether this action is completed */
  completed: boolean;
  /** Display text for the action title (already translated) */
  title: string;
  /** Display text for the description (already translated) */
  description?: string;
  /** Callback when the card is tapped/clicked */
  onToggle: (actionId: string) => void;
  /** Optional target display (e.g. "100" / "12 rak'at") */
  targetLabel?: string;
}

// ── Component ────────────────────────────────────────────────

export function ActionCard({
  action,
  completed,
  title,
  description,
  onToggle,
  targetLabel,
}: ActionCardProps) {
  const iconName = action.iconName ?? CATEGORY_ICONS[action.category];

  return (
    <motion.button
      type="button"
      onClick={() => onToggle(action.id)}
      className={`
        group flex w-full items-center gap-3 rounded-xl p-3
        text-start transition-colors
        ${
          completed
            ? "bg-primary-50 dark:bg-primary-950/30"
            : "bg-white dark:bg-neutral-800/60"
        }
        border
        ${
          completed
            ? "border-primary-200 dark:border-primary-800"
            : "border-neutral-200 dark:border-neutral-700"
        }
      `}
      whileTap={{ scale: 0.98 }}
      layout
    >
      {/* Checkbox circle */}
      <div
        className={`
          flex h-8 w-8 shrink-0 items-center justify-center rounded-full
          transition-all duration-200
          ${
            completed
              ? "bg-primary-500 text-white shadow-sm"
              : "border-2 border-neutral-300 dark:border-neutral-600"
          }
        `}
      >
        {completed && <Icon name="check" className="h-4 w-4" />}
      </div>

      {/* Icon + text */}
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Icon
          name={iconName}
          className={`h-5 w-5 shrink-0 ${
            completed
              ? "text-primary-500"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium leading-tight ${
              completed
                ? "text-primary-700 line-through decoration-primary-300 dark:text-primary-300"
                : "text-neutral-900 dark:text-neutral-100"
            }`}
          >
            {title}
          </p>
          {description && (
            <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Target badge */}
      {targetLabel && (
        <span className="shrink-0 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300">
          {targetLabel}
        </span>
      )}
    </motion.button>
  );
}
