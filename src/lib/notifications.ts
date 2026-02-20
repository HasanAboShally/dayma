// ============================================================
// Ramadan Companion — Daily Reminder Notifications
// Simple 21:00 daily check-in reminder via the Notification API
// ============================================================

const STORAGE_KEY = "ramadan-reminder";
const REMINDER_HOUR = 21; // 9 PM
const REMINDER_MINUTE = 0;

// ── Preferences ──────────────────────────────────────────────

export interface ReminderPrefs {
  enabled: boolean;
  /** ISO timestamp of last scheduled/shown notification */
  lastShown?: string;
}

export function loadReminderPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { enabled: false };
}

export function saveReminderPrefs(prefs: ReminderPrefs): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

// ── Permission ───────────────────────────────────────────────

export function isNotificationSupported(): boolean {
  return "Notification" in window;
}

export function getPermissionState(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
}

// ── Scheduling ───────────────────────────────────────────────

let scheduledTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Returns ms until the next occurrence of HH:MM today or tomorrow.
 */
function msUntilNextReminder(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);

  // If we already passed 21:00 today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

/**
 * Show the notification via the SW (so it works even when tab is in
 * the background). Falls back to the Notification constructor if no SW.
 */
async function showReminder(): Promise<void> {
  const prefs = loadReminderPrefs();
  if (!prefs.enabled) return;
  if (Notification.permission !== "granted") return;

  const title = "Ramadan Companion 🌙";
  const body = "Time for your daily check-in! How was your day?";
  const icon = "/icons/icon-192x192.png";
  const badge = "/icons/badge-72x72.png";

  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) {
      await reg.showNotification(title, {
        body,
        icon,
        badge,
        vibrate: [100, 50, 100],
        tag: "daily-reminder", // Prevents duplicate notifications
        data: { url: "/en/app/today" },
      });
    } else {
      // Fallback — direct Notification (only works while tab is visible)
      new Notification(title, { body, icon, badge });
    }
  } catch {
    // Silent fail — SW may not be available in dev
    new Notification(title, { body, icon });
  }

  // Update last-shown timestamp
  saveReminderPrefs({ ...prefs, lastShown: new Date().toISOString() });

  // Schedule the next one (tomorrow)
  scheduleNextReminder();
}

/**
 * Schedule the next daily reminder. Safe to call multiple times — it
 * clears any existing timer first.
 */
function scheduleNextReminder(): void {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }

  const ms = msUntilNextReminder();
  scheduledTimer = setTimeout(showReminder, ms);
}

// ── Public API ───────────────────────────────────────────────

/**
 * Enable daily reminder at 21:00. Requests permission if needed.
 * Returns true if successfully enabled.
 */
export async function enableReminder(): Promise<boolean> {
  const permission = await requestPermission();
  if (permission !== "granted") return false;

  saveReminderPrefs({ enabled: true });
  scheduleNextReminder();
  return true;
}

/**
 * Disable the daily reminder.
 */
export function disableReminder(): void {
  if (scheduledTimer) {
    clearTimeout(scheduledTimer);
    scheduledTimer = null;
  }
  saveReminderPrefs({ enabled: false });
}

/**
 * Call on app startup — if reminders were previously enabled,
 * re-schedule the next one automatically.
 */
export function initReminders(): void {
  if (!isNotificationSupported()) return;
  const prefs = loadReminderPrefs();
  if (prefs.enabled && Notification.permission === "granted") {
    scheduleNextReminder();
  }
}
