"use client";

// Tiny, privacy-safe analytics seam. It NEVER sends resume content, contact
// details, or anything the user typed — only a short event name and a few
// low-cardinality, non-identifying fields (e.g. which format was downloaded,
// which template). If no analytics sink is present on the page it no-ops, so the
// app works identically with or without one. Wire a real provider later by
// reading window.dataLayer / a `plausible()` global; nothing here blocks the UI.

export type AnalyticsProps = Record<string, string | number | boolean>;

export function track(event: string, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      dataLayer?: unknown[];
      plausible?: (e: string, opts?: { props: AnalyticsProps }) => void;
    };
    // Google Tag Manager style, if present.
    if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props });
    // Plausible style, if present.
    if (typeof w.plausible === "function") w.plausible(event, { props });
  } catch {
    // Analytics must never break the user's export or navigation.
  }
}
