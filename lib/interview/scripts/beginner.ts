import { userFact } from "@/lib/profile/facts";
import type { MasterProfile, ProjectEntry, TargetRole } from "@/lib/profile/types";
import type { Answer, Script } from "../types";

const answered = (a?: Answer): a is Answer =>
  !!a && a.action === "answered" && typeof a.value === "string" && a.value.trim().length > 0;
const text = (a?: Answer): string => (answered(a) ? String(a.value).trim() : "");

/**
 * Beginner question sequence (Prompt 4b). Plain language only — no "achievement",
 * "competency", "summary", or "transferable skills". Encouraging progress messages.
 * Kept as short as it needs to be. Milestone: experience_discovered.
 */
export const beginnerScript: Script = {
  id: "beginner",
  title: "Your story",
  milestone: "experience_discovered",
  totalHint: 7,
  start: "opportunity",
  questions: {
    opportunity: {
      id: "opportunity",
      kind: "single_select",
      prompt: "What kind of opportunity are you looking for?",
      progressMessage: "Let's find out what you're aiming for.",
      options: [
        { id: "first_job", label: "My first job" },
        { id: "part_time", label: "Part-time or casual work" },
        { id: "full_time", label: "Full-time work" },
        { id: "internship", label: "An internship or placement" },
        { id: "not_sure", label: "I'm not sure yet" },
      ],
      allow: { back: false, skip: true },
    },
    interest: {
      id: "interest",
      kind: "short_text",
      prompt: "What job or type of work interests you?",
      helper: "Even a rough idea is fine — we can refine it later.",
      placeholder: "e.g. retail, admin, hospitality, care work",
      progressMessage: "Good. Now let's look at what you've done.",
      allow: { skip: true, dont_know: true, back: true },
    },
    done_so_far: {
      id: "done_so_far",
      kind: "long_text",
      prompt: "What have you done so far — work, school, volunteering, projects, or anything else?",
      helper: "Don't worry about wording. Just tell us in your own words.",
      placeholder: "e.g. I helped out at my uncle's shop and did a group project at college",
      progressMessage: "Nice — there's more here than you might think.",
      allow: { skip: true, dont_know: true, back: true },
    },
    one_thing: {
      id: "one_thing",
      kind: "short_text",
      prompt: "Tell me about one thing you have done.",
      helper: "Pick anything — a job, a class project, helping someone out.",
      placeholder: "e.g. Helped run the till at a weekend market",
      progressMessage: "Your career story is taking shape.",
      allow: { skip: true, back: true },
    },
    personally_did: {
      id: "personally_did",
      kind: "long_text",
      prompt: "What did you personally do?",
      helper: "The part that was yours — not what the whole team did.",
      placeholder: "e.g. I took payments and helped customers find things",
      progressMessage: "Great. This is the heart of your resume.",
      allow: { skip: true, dont_know: true, back: true },
    },
    proud_of: {
      id: "proud_of",
      kind: "long_text",
      prompt: "What are you proud of?",
      helper: "Anything at all. There's no wrong answer, and you can skip this.",
      placeholder: "e.g. Customers often came back and asked for me",
      progressMessage: "You're nearly there.",
      allow: { skip: true, dont_know: true, not_applicable: true, back: true },
    },
    employers_know: {
      id: "employers_know",
      kind: "long_text",
      prompt: "What would you like employers to know about you?",
      helper: "In your own words. This helps us write your summary later.",
      placeholder: "e.g. I'm reliable, I learn fast, and I turn up on time",
      progressMessage: "That's everything we need for now.",
      allow: { skip: true, back: true },
      next: () => null, // end
    },
  },
  commit(profile: MasterProfile, answers, now): MasterProfile {
    let next = { ...profile };

    // Target role — user-provided, from what interests them.
    const interest = text(answers.interest);
    if (interest) {
      const opportunity = answered(answers.opportunity) ? String(answers.opportunity.value) : undefined;
      const role: TargetRole = { title: interest, notes: opportunity };
      next = { ...next, targetRole: userFact(role, now) };
    }

    // "One thing you've done" becomes a Projects / Activities entry — NEVER assumed
    // to be formal employment (AI rules). Contribution + pride become highlights.
    const oneThing = text(answers.one_thing);
    if (oneThing) {
      const highlights = [text(answers.personally_did), text(answers.proud_of)]
        .filter((s) => s.length > 0)
        .map((s) => userFact(s, now));
      const description = text(answers.done_so_far);
      const entry: ProjectEntry = {
        id: `activity_${now}`,
        name: userFact(oneThing, now),
        kind: "other",
        description: description ? userFact(description, now) : undefined,
        highlights,
      };
      next = { ...next, projects: [...next.projects, entry] };
    }

    // Store "what employers should know" as a project highlight-free note by seeding
    // it onto the target role notes so the summary step (Prompt 13) can use it —
    // still user-provided, still traceable.
    const employers = text(answers.employers_know);
    if (employers && next.targetRole) {
      next = {
        ...next,
        targetRole: userFact(
          { ...next.targetRole.value, notes: [next.targetRole.value.notes, employers].filter(Boolean).join(" — ") },
          now,
        ),
      };
    }

    return next;
  },
};
