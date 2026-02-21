// ============================================================
// Ramadan Companion — Cloud Backup (Firebase Scaffolding)
// Provides cloud sync infrastructure using Firebase Firestore.
// 
// SETUP REQUIRED:
// 1. Create a Firebase project at https://console.firebase.google.com
// 2. Enable Anonymous Auth + Google Auth
// 3. Enable Cloud Firestore
// 4. Add environment variables to .env:
//    PUBLIC_FIREBASE_API_KEY=...
//    PUBLIC_FIREBASE_AUTH_DOMAIN=...
//    PUBLIC_FIREBASE_PROJECT_ID=...
//    PUBLIC_FIREBASE_STORAGE_BUCKET=...
//    PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
//    PUBLIC_FIREBASE_APP_ID=...
// ============================================================

import type { AppState } from "@/lib/app-types";

// ── Firebase Configuration ───────────────────────────────────

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY;
  const projectId = import.meta.env.PUBLIC_FIREBASE_PROJECT_ID;

  if (!apiKey || !projectId) return null;

  return {
    apiKey,
    authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    projectId,
    storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "",
  };
}

// ── Cloud Sync Interface ─────────────────────────────────────

export interface CloudSyncStatus {
  enabled: boolean;
  lastSyncedAt: string | null;
  userId: string | null;
  provider: "anonymous" | "google" | null;
}

/**
 * Check if Firebase cloud backup is configured.
 */
export function isCloudSyncAvailable(): boolean {
  return getFirebaseConfig() !== null;
}

/**
 * Get the current cloud sync status from localStorage.
 */
export function getCloudSyncStatus(): CloudSyncStatus {
  if (typeof localStorage === "undefined") {
    return { enabled: false, lastSyncedAt: null, userId: null, provider: null };
  }

  return {
    enabled: localStorage.getItem("dayma_cloud_enabled") === "1",
    lastSyncedAt: localStorage.getItem("dayma_cloud_last_sync"),
    userId: localStorage.getItem("dayma_cloud_uid"),
    provider: (localStorage.getItem("dayma_cloud_provider") as "anonymous" | "google") || null,
  };
}

/**
 * Initialize cloud sync with Firebase.
 * Lazy-loads Firebase SDK to avoid bloating the main bundle.
 * 
 * @returns The authenticated user's ID, or null if failed.
 */
export async function initCloudSync(method: "anonymous" | "google" = "anonymous"): Promise<string | null> {
  const config = getFirebaseConfig();
  if (!config) {
    console.warn("[CloudSync] Firebase not configured. Add env vars to enable.");
    return null;
  }

  try {
    // Dynamic import to keep main bundle small
    const { initializeApp } = await import("firebase/app");
    const { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider } = await import("firebase/auth");

    const app = initializeApp(config);
    const auth = getAuth(app);

    let uid: string | null = null;

    if (method === "google") {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      uid = result.user.uid;
    } else {
      const result = await signInAnonymously(auth);
      uid = result.user.uid;
    }

    if (uid) {
      localStorage.setItem("dayma_cloud_enabled", "1");
      localStorage.setItem("dayma_cloud_uid", uid);
      localStorage.setItem("dayma_cloud_provider", method);
    }

    return uid;
  } catch (error) {
    console.error("[CloudSync] Init failed:", error);
    return null;
  }
}

/**
 * Upload the current state to Firestore.
 */
export async function uploadState(state: AppState): Promise<boolean> {
  const config = getFirebaseConfig();
  const uid = localStorage.getItem("dayma_cloud_uid");
  if (!config || !uid) return false;

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore, doc, setDoc } = await import("firebase/firestore");

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
    const db = getFirestore(app);

    await setDoc(doc(db, "users", uid), {
      state: JSON.parse(JSON.stringify(state)),
      updatedAt: new Date().toISOString(),
      version: state.version,
    });

    localStorage.setItem("dayma_cloud_last_sync", new Date().toISOString());
    return true;
  } catch (error) {
    console.error("[CloudSync] Upload failed:", error);
    return false;
  }
}

/**
 * Download state from Firestore.
 */
export async function downloadState(): Promise<AppState | null> {
  const config = getFirebaseConfig();
  const uid = localStorage.getItem("dayma_cloud_uid");
  if (!config || !uid) return null;

  try {
    const { initializeApp, getApps } = await import("firebase/app");
    const { getFirestore, doc, getDoc } = await import("firebase/firestore");

    const app = getApps().length > 0 ? getApps()[0] : initializeApp(config);
    const db = getFirestore(app);

    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;

    const data = snap.data();
    return data.state as AppState;
  } catch (error) {
    console.error("[CloudSync] Download failed:", error);
    return null;
  }
}

/**
 * Disable cloud sync and clear stored credentials.
 */
export function disableCloudSync(): void {
  localStorage.removeItem("dayma_cloud_enabled");
  localStorage.removeItem("dayma_cloud_uid");
  localStorage.removeItem("dayma_cloud_provider");
  localStorage.removeItem("dayma_cloud_last_sync");
}
