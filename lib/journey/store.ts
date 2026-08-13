"use client";

// Lightweight, self-contained persistence for the Career Journey draft. Kept
// separate from the resume MasterProfile store so the journey can evolve without
// touching existing working flows. Everything the user types is saved locally on
// every change, so an AI failure or refresh never loses their input.

export type CareerStory = { id: string; title: string; detail: string };

export type JourneyDraft = {
  experiencesText: string;
  skills: string[];
  stories: CareerStory[];
  goal: string;
  updatedAt: string;
};

const KEY = "tac.journey.v1";

export function emptyDraft(): JourneyDraft {
  return { experiencesText: "", skills: [], stories: [], goal: "", updatedAt: "" };
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function loadDraft(): JourneyDraft {
  if (!hasStorage()) return emptyDraft();
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return emptyDraft();
  try {
    return { ...emptyDraft(), ...(JSON.parse(raw) as JourneyDraft) };
  } catch {
    return emptyDraft();
  }
}

export function saveDraft(d: JourneyDraft): void {
  if (!hasStorage()) return;
  const next = { ...d, updatedAt: new Date().toISOString() };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function makeId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  return c?.randomUUID ? c.randomUUID() : `s_${Math.random().toString(36).slice(2)}`;
}
