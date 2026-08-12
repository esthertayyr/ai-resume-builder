import { aiConfirmedFact, editFact, userFact } from "@/lib/profile/facts";
import type { ExperienceEntry, Fact, MasterProfile } from "@/lib/profile/types";

// Responsibility Discovery logic (kept pure + framework-free so it's fully testable).
//
// The core trust rule lives here: AI suggestions are NEVER facts. A suggested card
// only becomes resume data once the user CONFIRMS (or edits, or adds their own). A
// card left "suggested" or "rejected" contributes nothing. See ARCHITECTURE.md §2.

export type CardState = "suggested" | "confirmed" | "rejected" | "edited";

export interface ResponsibilityCard {
  id: string;
  /** Current text — may differ from `original` once edited. */
  text: string;
  /** The verbatim AI suggestion, kept immutable for the audit trail. "" if user-added. */
  original: string;
  rationale?: string;
  state: CardState;
  /** True for a card the user typed themselves (not an AI suggestion). */
  userAdded?: boolean;
}

export function cardsFromSuggestions(
  suggestions: { text: string; rationale?: string }[],
): ResponsibilityCard[] {
  return suggestions.map((s, i) => ({
    id: `sug_${i}`,
    text: s.text,
    original: s.text,
    rationale: s.rationale,
    state: "suggested",
  }));
}

/** A card the user added by hand — confirmed by definition, user-provided. */
export function userAddedCard(text: string, index: number): ResponsibilityCard {
  return { id: `own_${index}`, text, original: "", state: "confirmed", userAdded: true };
}

/** How many cards will actually contribute to the resume. */
export function confirmedCount(cards: ResponsibilityCard[]): number {
  return cards.filter((c) => c.state === "confirmed" || c.state === "edited").length;
}

/**
 * Build an Experience entry from the cards, including ONLY those the user confirmed,
 * edited, or added. Provenance is stamped per fact:
 *  - confirmed AI suggestion  -> aiConfirmedFact (keeps originalSuggestion)
 *  - edited AI suggestion      -> editFact over the confirmed fact (edit flagged, original kept)
 *  - user-added / edited-own   -> userFact
 * `where` (employer) is user-provided and optional; stored as an empty fact if unknown.
 */
export function buildExperienceFromCards(
  jobTitle: string,
  where: string | undefined,
  cards: ResponsibilityCard[],
  now: string,
): ExperienceEntry {
  const responsibilities: Fact<string>[] = [];
  for (const c of cards) {
    const text = c.text.trim();
    if (!text) continue;
    if (c.state === "confirmed") {
      responsibilities.push(c.userAdded ? userFact(text, now) : aiConfirmedFact(text, c.original, now));
    } else if (c.state === "edited") {
      if (c.userAdded) {
        responsibilities.push(userFact(text, now));
      } else {
        responsibilities.push(editFact(aiConfirmedFact(c.original, c.original, now), text, now));
      }
    }
    // "suggested" and "rejected" contribute nothing — prefer omission over guessing.
  }
  return {
    id: `exp_${now}`,
    company: userFact(where?.trim() ? where.trim() : "", now),
    title: userFact(jobTitle.trim(), now),
    responsibilities,
    achievements: [],
  };
}

/** Append the entry and advance the Experience milestone. Returns a new profile. */
export function addExperienceToProfile(
  profile: MasterProfile,
  entry: ExperienceEntry,
  now: string,
): MasterProfile {
  return {
    ...profile,
    experience: [...profile.experience, entry],
    progress: {
      ...profile.progress,
      milestones: {
        ...profile.progress.milestones,
        experience_discovered: { status: "complete", lastVisitedAt: now },
      },
    },
  };
}
