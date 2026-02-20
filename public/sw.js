/**
 * Service Worker for PWA — full offline support
 *
 * Strategy:
 *   - App shell pages: precached on install → networkFirst at runtime
 *   - Hashed assets (/_astro/*): cacheFirst (immutable, safe)
 *   - Images: staleWhileRevalidate
 *   - Everything else: networkFirst
 *
 * Bump CACHE_VERSION only when the cache schema changes (new precache
 * list, new strategy, etc.), NOT on every deploy. Hashed Astro assets
 * are already content-addressed so old versions are harmless.
 */

const CACHE_VERSION = "v4";
const CACHE_NAME = "app-cache-" + CACHE_VERSION;
const OFFLINE_URL = "/offline.html";

// App shell pages — precached on install for instant offline access
const APP_SHELL = [
  "/offline.html",
  "/manifest.json",
  "/en/app/today",
  "/en/app/progress",
  "/en/app/setup",
  "/en/app/settings",
  "/ar/app/today",
  "/ar/app/progress",
  "/ar/app/setup",
  "/ar/app/settings",
];

// ── Cache strategies ────────────────────────────────────────

/** Network first, fall back to cache (HTML pages, default) */
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(OFFLINE_URL);
  }
}

/** Cache first, fall back to network (hashed/immutable assets) */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

/** Stale while revalidate (images, semi-dynamic content) */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((res) => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  });

  return cached || fetchPromise;
}

// ── Lifecycle events ────────────────────────────────────────

// Install: precache app shell, then activate immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

// Activate: purge old caches, claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ── Fetch routing ───────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, cross-origin, and API requests
  if (request.method !== "GET") return;
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Skip Vite dev-server internal files — these change on every
  // dep-optimization pass and must never be served from SW cache.
  if (
    url.pathname.includes("/node_modules/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/__") ||
    url.pathname.startsWith("/src/")
  )
    return;

  let strategy;

  if (request.destination === "document") {
    // HTML pages — always try network first for freshness
    strategy = networkFirst;
  } else if (
    url.pathname.startsWith("/_astro/") ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  ) {
    // Immutable hashed assets & fonts — cache first (safe)
    strategy = cacheFirst;
  } else if (request.destination === "image") {
    strategy = staleWhileRevalidate;
  } else {
    strategy = networkFirst;
  }

  event.respondWith(strategy(request));
});

// ── Push notifications ──────────────────────────────────────

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" },
      actions: data.actions || [],
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
