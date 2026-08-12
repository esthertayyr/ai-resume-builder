"use client";

import type { EngineState } from "@/lib/interview/types";
import { createEmptyProfile } from "@/lib/profile/factory";
import type { MasterProfile } from "@/lib/profile/types";

// MVP persistence: localStorage-backed so the interview survives a refresh or a
// closed tab (ARCHITECTURE.md §3). The server-backed session + recovery link is the
// planned upgrade; the shapes here already match what the server will persist.

const PROFILE_KEY = "acb.profile";
const PROFILE_ID_KEY = "acb.profileId";
const ENGINE_PREFIX = "acb.engine.";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function nowIso(): string {
  // Client-only module; Date is available here (unlike shared workflow code).
  return new Date().toISOString();
}

function makeId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  return c?.randomUUID ? c.randomUUID() : `p_${Math.abs(hashString(nowIso()))}`;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h;
}

export function getProfileId(): string {
  if (!hasStorage()) return "anonymous";
  let id = window.localStorage.getItem(PROFILE_ID_KEY);
  if (!id) {
    id = makeId();
    window.localStorage.setItem(PROFILE_ID_KEY, id);
  }
  return id;
}

export function loadProfile(): MasterProfile {
  if (hasStorage()) {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw) as MasterProfile;
      } catch {
        /* fall through to a fresh profile */
      }
    }
  }
  return createEmptyProfile(getProfileId(), nowIso());
}

export function saveProfile(p: MasterProfile): void {
  if (!hasStorage()) return;
  p.updatedAt = nowIso();
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

export function loadEngineState(scriptId: string): EngineState | null {
  if (!hasStorage()) return null;
  const raw = window.localStorage.getItem(ENGINE_PREFIX + scriptId);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EngineState;
  } catch {
    return null;
  }
}

export function saveEngineState(state: EngineState): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(ENGINE_PREFIX + state.scriptId, JSON.stringify(state));
}

/** Data deletion (Prompt 19): wipe everything this browser holds. */
export function deleteAllLocalData(): void {
  if (!hasStorage()) return;
  const keys: string[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && (k === PROFILE_KEY || k === PROFILE_ID_KEY || k.startsWith(ENGINE_PREFIX))) {
      keys.push(k);
    }
  }
  keys.forEach((k) => window.localStorage.removeItem(k));
}

export { nowIso };
