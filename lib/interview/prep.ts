// Interview preparation content — a fixed bank of common questions with honest,
// practical guidance. Behavioural questions include STAR scaffolding. We do NOT
// score answers: there is no objective AI measure of interview performance, so we
// offer a self-check the user applies themselves.

export type PrepQuestion = {
  id: string;
  question: string;
  /** Why interviewers ask this. */
  why: string;
  /** Short, concrete guidance. */
  guidance: string;
  /** Behavioural questions benefit from STAR structure. */
  star?: boolean;
};

export const PREP_QUESTIONS: PrepQuestion[] = [
  {
    id: "tell-me-about-yourself",
    question: "Tell me about yourself.",
    why: "It's an opener that sets the tone. They want a short, relevant story — not your life history.",
    guidance:
      "Give a 30–60 second answer: who you are professionally, one or two things you're good at, and why you're here for this role. Keep personal detail brief.",
  },
  {
    id: "why-this-job",
    question: "Why do you want this job?",
    why: "They're checking whether you understand the role and are genuinely interested.",
    guidance:
      "Connect something specific about the role or organisation to what you want to do. Avoid generic answers that could apply to any job.",
  },
  {
    id: "strengths",
    question: "What are your strengths?",
    why: "They want strengths that matter for this role — with evidence.",
    guidance:
      "Name two or three real strengths and back each with a quick example. 'Organised' means little on its own; 'I kept our team's schedule running across three sites' shows it.",
  },
  {
    id: "weakness",
    question: "What is your greatest weakness?",
    why: "They're looking for honesty and self-awareness, not a hidden brag.",
    guidance:
      "Pick a genuine area you're improving and say what you're doing about it. Avoid clichés like 'I'm a perfectionist.'",
  },
  {
    id: "challenge",
    question: "Tell me about a time you faced a challenge.",
    why: "A behavioural question — they want to see how you actually handle difficulty.",
    guidance: "Use STAR. Focus on what you did and what changed as a result.",
    star: true,
  },
  {
    id: "teamwork",
    question: "Tell me about a time you worked in a team.",
    why: "They want to know how you collaborate and handle your share of the work.",
    guidance: "Use STAR. Be clear about your own contribution, not just what the team did.",
    star: true,
  },
  {
    id: "future",
    question: "Where do you see yourself in a few years?",
    why: "They're gauging your direction and whether the role fits your plans.",
    guidance:
      "Show ambition that's realistic and connected to this kind of work. It's fine to be honest that you're still exploring — pair it with a willingness to grow.",
  },
  {
    id: "why-hire-you",
    question: "Why should we hire you?",
    why: "Your chance to summarise your fit in a sentence or two.",
    guidance:
      "Match your strongest, most relevant strengths to what the role needs. Be confident and specific without overclaiming.",
  },
  {
    id: "your-questions",
    question: "Do you have any questions for us?",
    why: "Saying 'no' can read as low interest. Good questions show you're engaged.",
    guidance:
      "Prepare two or three real questions — about the team, what success looks like in the role, or how they work. Avoid asking only about pay and time off.",
  },
];

export const STAR_STEPS = [
  { key: "situation", label: "Situation", hint: "Set the scene briefly — where and when." },
  { key: "task", label: "Task", hint: "What were you responsible for?" },
  { key: "action", label: "Action", hint: "What did you actually do? (This is the important part.)" },
  { key: "result", label: "Result", hint: "What happened? Include a number if you have one." },
] as const;

export type StarKey = (typeof STAR_STEPS)[number]["key"];

// A self-check the user applies to their own answer — not a machine score.
export const SELF_CHECK = [
  "Did I answer the actual question asked?",
  "Is it specific — a real example, not a general claim?",
  "Is it concise (roughly 30–90 seconds spoken)?",
  "Does it show what I did, not just what happened around me?",
  "Would it make sense to someone who doesn't know me?",
];
