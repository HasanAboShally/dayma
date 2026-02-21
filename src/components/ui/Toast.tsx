// ============================================================
// Ramadan Companion — Toast Notification System
// Lightweight event-driven toast for storage warnings, etc.
// ============================================================

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// ── Event Bus ────────────────────────────────────────────────

type ToastVariant = "info" | "warning" | "error" | "success";

interface ToastData {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

type ToastListener = (toast: ToastData) => void;

const listeners = new Set<ToastListener>();
let nextId = 0;

/**
 * Show a global toast notification.
 * Works from anywhere — no React context needed.
 */
export function showToast(
  message: string,
  variant: ToastVariant = "info",
  duration = 4000,
): void {
  const toast: ToastData = { id: ++nextId, message, variant, duration };
  for (const listener of listeners) {
    listener(toast);
  }
}

// ── React Component ──────────────────────────────────────────

const VARIANT_STYLES: Record<ToastVariant, string> = {
  info: "bg-secondary-800 text-white dark:bg-secondary-700",
  success: "bg-emerald-600 text-white",
  warning: "bg-amber-500 text-white",
  error: "bg-red-600 text-white",
};

/**
 * Mount this once in your layout. It listens to showToast() calls
 * and renders toasts at the bottom of the viewport.
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const handler: ToastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="true"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto rounded-2xl px-5 py-3 text-sm font-semibold shadow-lg ${
              VARIANT_STYLES[toast.variant]
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
