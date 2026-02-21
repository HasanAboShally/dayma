// ============================================================
// Ramadan Companion — Prayer Time Estimation
// Simple solar calculation for approximate Fajr/Maghrib times.
// Used for contextual suhoor/iftar banners.
// Falls back to hardcoded ranges when geolocation is unavailable.
// ============================================================

interface PrayerWindow {
  /** Hour (0-23) when suhoor reminder should start */
  suhoorStart: number;
  /** Hour (0-23) when suhoor reminder should end (≈ Fajr) */
  suhoorEnd: number;
  /** Hour (0-23) when iftar reminder should start */
  iftarStart: number;
  /** Hour (0-23) when iftar reminder should end */
  iftarEnd: number;
}

// ── Default fallback (covers most latitudes during Ramadan) ──

const DEFAULT_WINDOW: PrayerWindow = {
  suhoorStart: 3,
  suhoorEnd: 6,
  iftarStart: 16,
  iftarEnd: 20,
};

// ── Cache ────────────────────────────────────────────────────

let cachedWindow: PrayerWindow | null = null;
let cachedDate: string | null = null;

// ── Solar Calculation (simplified) ──────────────────────────

/** Convert degrees to radians */
const toRad = (d: number) => (d * Math.PI) / 180;
/** Convert radians to degrees */
const toDeg = (r: number) => (r * 180) / Math.PI;

/**
 * Calculate approximate solar noon and day length for a given
 * latitude and day-of-year. Returns Fajr (start of twilight)
 * and Maghrib (sunset) hours in local time (approximate).
 */
function calculateSunTimes(
  lat: number,
  _lng: number,
  date: Date,
): { fajrHour: number; maghribHour: number } {
  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        86400000,
    );

  // Solar declination (simplified)
  const declination = -23.45 * Math.cos(toRad((360 / 365) * (dayOfYear + 10)));

  // Hour angle for sunset (when sun is at 0.83° below horizon)
  const latRad = toRad(lat);
  const declRad = toRad(declination);
  const cosHourAngle = Math.max(
    -1,
    Math.min(
      1,
      (-Math.sin(toRad(0.83)) - Math.sin(latRad) * Math.sin(declRad)) /
        (Math.cos(latRad) * Math.cos(declRad)),
    ),
  );
  const hourAngle = toDeg(Math.acos(cosHourAngle));

  // Approximate sunrise/sunset in hours from solar noon (≈12:00 local)
  const solarNoon = 12; // Simplified — true solar noon varies by longitude/timezone
  const sunriseHour = solarNoon - hourAngle / 15;
  const sunsetHour = solarNoon + hourAngle / 15;

  // Fajr: approximately 1.5 hours before sunrise (astronomical twilight ~18°)
  const fajrHour = sunriseHour - 1.5;
  // Maghrib: at sunset
  const maghribHour = sunsetHour;

  return { fajrHour, maghribHour };
}

/**
 * Get prayer time windows for banner display.
 * Uses cached geolocation if available.
 */
export function getPrayerWindows(date?: Date): PrayerWindow {
  // SSR guard — localStorage not available on server
  if (typeof localStorage === "undefined") return DEFAULT_WINDOW;

  const now = date || new Date();
  const dateKey = now.toISOString().slice(0, 10);

  // Return cached if same day
  if (cachedWindow && cachedDate === dateKey) return cachedWindow;

  // Try saved coordinates
  const savedLat = localStorage.getItem("dayma_lat");
  const savedLng = localStorage.getItem("dayma_lng");

  if (savedLat && savedLng) {
    const lat = Number.parseFloat(savedLat);
    const lng = Number.parseFloat(savedLng);
    const { fajrHour, maghribHour } = calculateSunTimes(lat, lng, now);

    cachedWindow = {
      suhoorStart: Math.floor(fajrHour - 1.5), // ~1.5h before Fajr
      suhoorEnd: Math.ceil(fajrHour),
      iftarStart: Math.floor(maghribHour - 1), // ~1h before Maghrib
      iftarEnd: Math.ceil(maghribHour + 0.5),
    };
    cachedDate = dateKey;
    return cachedWindow;
  }

  return DEFAULT_WINDOW;
}

/**
 * Request geolocation and cache the coordinates.
 * Call once during setup or on user action.
 * Returns true if coordinates were obtained.
 */
export async function requestLocation(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return false;

  return new Promise<boolean>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        localStorage.setItem("dayma_lat", String(pos.coords.latitude));
        localStorage.setItem("dayma_lng", String(pos.coords.longitude));
        // Clear cache so next call recalculates
        cachedWindow = null;
        cachedDate = null;
        resolve(true);
      },
      () => resolve(false),
      { timeout: 10000, enableHighAccuracy: false },
    );
  });
}

/**
 * Check if location data is available.
 */
export function hasLocationData(): boolean {
  if (typeof localStorage === "undefined") return false;
  return !!(localStorage.getItem("dayma_lat") && localStorage.getItem("dayma_lng"));
}
