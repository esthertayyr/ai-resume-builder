import type { Fact, MasterProfile } from "@/lib/profile/types";

// Achievement Discovery (Prompt 11 / spec §20). We never ask "what are your biggest
// achievements?" — that intimidates beginners. Instead we ask simple yes/no prompts,
// and only turn a "yes" into resume content once the user describes it and confirms
// the wording. If someone has no achievements, that is completely fine.

export interface AchievementQuestion {
  id: string;
  question: string;
  /** Follow-up shown only after a "yes", to gather the real detail. */
  followup: string;
}

export const ACHIEVEMENT_QUESTIONS: AchievementQuestion[] = [
  { id: "problem", question: "Did you ever solve a difficult problem?", followup: "What was the problem, and what did you do?" },
  { id: "trained", question: "Did you ever help train someone or show them the ropes?", followup: "Who did you help, and with what?" },
  { id: "relied", question: "Did people rely on you for something?", followup: "What did they rely on you for?" },
  { id: "improved", question: "Did you improve the way something was done?", followup: "What did you change or make better?" },
  { id: "busy", question: "Did you handle a very busy period?", followup: "What was busy, and how did you handle it?" },
  { id: "feedback", question: "Did you ever get positive feedback?", followup: "Who gave it, and what was it for?" },
];

/**
 * Attach a confirmed achievement to the most recent Experience entry. If there is no
 * experience yet, attach it to the most recent Project/Activity as a highlight. If the
 * profile has neither, return it unchanged (the UI only offers this when there's
 * somewhere truthful to put it). Returns a new profile — never mutates.
 */
export function attachAchievement(profile: MasterProfile, fact: Fact<string>, _now: string): MasterProfile {
  if (profile.experience.length > 0) {
    const experience = profile.experience.map((e, i) =>
      i === profile.experience.length - 1 ? { ...e, achievements: [...e.achievements, fact] } : e,
    );
    return { ...profile, experience };
  }
  if (profile.projects.length > 0) {
    const projects = profile.projects.map((p, i) =>
      i === profile.projects.length - 1 ? { ...p, highlights: [...p.highlights, fact] } : p,
    );
    return { ...profile, projects };
  }
  return profile;
}

/** True when there's somewhere truthful to record an achievement. */
export function canRecordAchievements(profile: MasterProfile): boolean {
  return profile.experience.length > 0 || profile.projects.length > 0;
}
