import { userFact } from "@/lib/profile/facts";
import type { MasterProfile } from "@/lib/profile/types";
import type { Answer, Script } from "../types";

const answered = (a?: Answer): a is Answer =>
  !!a && a.action === "answered" && typeof a.value === "string" && a.value.trim().length > 0;

/**
 * Milestone: basic_profile. Captures contact essentials a resume can't omit.
 * Kept separate from the story questions so the beginner sequence (Prompt 4b) stays
 * exactly as specified. All answers are user-provided facts.
 */
export const basicsScript: Script = {
  id: "basics",
  title: "The basics",
  milestone: "basic_profile",
  totalHint: 3,
  start: "name",
  questions: {
    name: {
      id: "name",
      kind: "short_text",
      prompt: "First, what should we call you?",
      helper: "Your name as you'd like it to appear on your resume.",
      placeholder: "e.g. Jordan Lee",
      progressMessage: "Let's begin.",
      allow: { back: false },
    },
    email: {
      id: "email",
      kind: "short_text",
      prompt: "What's the best email for employers to reach you?",
      helper: "You can skip this and add it later.",
      placeholder: "e.g. jordan.lee@email.com",
      progressMessage: "Almost set up.",
      allow: { skip: true, back: true },
    },
    location: {
      id: "location",
      kind: "short_text",
      prompt: "Where are you based?",
      helper: "A city or region is enough. Skip if you'd rather not say.",
      placeholder: "e.g. Manchester, UK",
      progressMessage: "The basics are in place.",
      allow: { skip: true, not_applicable: true, back: true },
    },
  },
  commit(profile: MasterProfile, answers, now): MasterProfile {
    const name = answers.name;
    const email = answers.email;
    const location = answers.location;
    return {
      ...profile,
      personal: {
        ...profile.personal,
        fullName: answered(name) ? userFact(String(name.value).trim(), now) : profile.personal.fullName,
        email: answered(email) ? userFact(String(email.value).trim(), now) : profile.personal.email,
        location: answered(location) ? userFact(String(location.value).trim(), now) : profile.personal.location,
      },
    };
  },
};
