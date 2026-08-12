import { describe, it, expect } from "vitest";
import {
  buildExperienceFromCards,
  cardsFromSuggestions,
  confirmedCount,
  userAddedCard,
  type ResponsibilityCard,
} from "@/lib/interview/responsibility";
import { isFact } from "@/lib/profile/facts";
import { createEmptyProfile } from "@/lib/profile/factory";
import { addExperienceToProfile } from "@/lib/interview/responsibility";
import { validateProfileSources } from "@/lib/profile/integrity";

const NOW = "2026-01-01T00:00:00.000Z";

function base(): ResponsibilityCard[] {
  return cardsFromSuggestions([
    { text: "Managed calendars and appointments", rationale: "common for VAs" },
    { text: "Responded to routine emails" },
    { text: "Conducted online research" },
  ]);
}

describe("Responsibility Discovery — trust rules", () => {
  it("cards from AI start as SUGGESTED (never auto-confirmed)", () => {
    const cards = base();
    expect(cards.every((c) => c.state === "suggested")).toBe(true);
    expect(confirmedCount(cards)).toBe(0);
  });

  it("un-confirmed suggestions contribute NOTHING to the resume", () => {
    const entry = buildExperienceFromCards("Virtual Assistant", "a client", base(), NOW);
    expect(entry.responsibilities).toHaveLength(0);
  });

  it("only confirmed / edited / user-added cards become facts", () => {
    const cards = base();
    cards[0].state = "confirmed"; // AI confirmed as-is
    cards[1].state = "rejected"; // explicitly rejected
    cards[2].state = "edited"; // AI suggestion the user changed
    cards[2].text = "Researched suppliers online";
    cards.push(userAddedCard("Booked travel", cards.length)); // user's own

    const entry = buildExperienceFromCards("Virtual Assistant", "a client", cards, NOW);
    const texts = entry.responsibilities.map((f) => f.value);
    expect(texts).toEqual(["Managed calendars and appointments", "Researched suppliers online", "Booked travel"]);
  });

  it("stamps correct provenance per card type", () => {
    const cards = base();
    cards[0].state = "confirmed";
    cards[1].state = "edited";
    cards[1].text = "Answered customer emails";
    const own = userAddedCard("Prepared invoices", 9);
    cards.push(own);

    const entry = buildExperienceFromCards("VA", "", cards, NOW);
    const [confirmed, edited, added] = entry.responsibilities;

    // Confirmed AI suggestion keeps its verbatim original.
    expect(confirmed.source).toBe("ai_suggested_confirmed");
    expect(confirmed.originalSuggestion).toBe("Managed calendars and appointments");

    // Edited AI suggestion: still AI-sourced, original preserved, flagged as edited.
    expect(edited.source).toBe("ai_suggested_confirmed");
    expect(edited.originalSuggestion).toBe("Responded to routine emails");
    expect(edited.value).toBe("Answered customer emails");
    expect(edited.editedByUser).toBe(true);

    // User's own line is user-provided.
    expect(added.source).toBe("user_provided");

    // Every responsibility is a properly-sourced Fact.
    expect(entry.responsibilities.every(isFact)).toBe(true);
  });

  it("produces a profile that passes source integrity", () => {
    const cards = base();
    cards.forEach((c) => (c.state = "confirmed"));
    const entry = buildExperienceFromCards("Cafe crew", "a local cafe", cards, NOW);
    const profile = addExperienceToProfile(createEmptyProfile("t", NOW), entry, NOW);

    expect(validateProfileSources(profile)).toHaveLength(0);
    expect(profile.progress.milestones.experience_discovered.status).toBe("complete");
  });
});
