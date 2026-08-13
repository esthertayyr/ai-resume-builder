import type { AIProvider, AIRequest, AIResponse, AISuggestion } from "./provider";

/**
 * Deterministic, offline provider. Default in development and tests — the whole
 * app works with zero API cost and zero secrets. It only ever produces SUGGESTIONS;
 * nothing here is treated as a fact until the user confirms it in the UI.
 */
export class MockAIProvider implements AIProvider {
  async complete(req: AIRequest): Promise<AIResponse> {
    switch (req.task) {
      case "responsibility_suggestions":
        return { suggestions: this.responsibilities(req.input) };
      case "skills_discovery":
        return { suggestions: this.skills(req.input) };
      case "summary_options":
        return { suggestions: this.summaries(req.input) };
      case "achievement_wording":
        return { suggestions: this.achievement(req.input) };
      case "extract_resume":
        return { suggestions: [] };
      case "cover_letter":
        return { suggestions: this.coverLetter(req.input) };
      case "look_closer":
        return { suggestions: this.lookCloser(req.input) };
      case "resume_review":
        return { suggestions: this.review(req.input) };
      case "job_match":
        return { suggestions: this.jobMatch(req.input) };
      case "interview_prep":
        return { suggestions: this.interview(req.input) };
      default:
        return { suggestions: [] };
    }
  }

  // ---- LOOK CLOSER: analyse a single experience entry. Evidence-first: every finding
  // quotes the user's own words. No numbers, teams, or achievements are invented. ----
  private lookCloser(input: Record<string, unknown>): AISuggestion[] {
    const text = String(input.text ?? "").trim();
    if (text.length < 12) return []; // route/UI turns "empty" into a friendly nudge
    const rules = SKILL_RULES;
    const out: AISuggestion[] = [];
    for (const { skill, match, why } of rules) {
      const m = text.match(match);
      if (m && !out.some((o) => o.text === skill)) {
        out.push({
          text: skill,
          rationale: quoteEvidence(text, m.index ?? 0),
          meta: { kind: "finding", explanation: why, confidence: "medium" },
        });
      }
    }
    return out.slice(0, 5);
  }

  // ---- REVIEW: editorial pass over the flattened resume text. Groups findings; never
  // rewrites. Deterministic heuristics stand in for the model when offline. ----
  private review(input: Record<string, unknown>): AISuggestion[] {
    const sections = (input.sections as { section: string; lines: string[] }[] | undefined) ?? [];
    const summary = String(input.summary ?? "").trim();
    const out: AISuggestion[] = [];
    const add = (category: string, section: string, issue: string, suggestion: string, priority: string) =>
      out.push({ text: issue, rationale: suggestion, meta: { category, section, priority } });

    if (!summary) {
      add("needs_evidence", "Summary", "No professional summary yet.", "Add 1–2 lines framing who you are and what you're aiming for.", "medium");
    } else if (summary.length < 40) {
      add("look_closer", "Summary", "The summary is very short.", "Add the strengths your experience already shows.", "low");
    }

    for (const s of sections) {
      const joined = s.lines.join(" ").toLowerCase();
      const vague = s.lines.filter((l) => /helped|worked|stuff|things|various|responsible for/i.test(l));
      if (vague.length) {
        add("look_closer", s.section, `Some wording is vague (e.g. "${vague[0].slice(0, 60)}").`, "Say what you actually did — the specific action counts.", "medium");
      }
      if (/customer|served|client/.test(joined)) {
        add("already_strong", s.section, "Clear customer-facing evidence here.", "This is a strength — keep it prominent.", "low");
      }
      const longLine = s.lines.find((l) => l.length > 220);
      if (longLine) add("optional_improvement", s.section, "One description is quite long.", "Consider splitting it into two tighter bullets.", "low");
    }
    if (!sections.length && !summary) {
      add("needs_evidence", "Resume", "There isn't much to look at yet.", "Add an experience or two — even small roles count.", "high");
    }
    return out;
  }

  // ---- JOB MATCH: compare confirmed resume evidence against a job description. Only
  // claims a match when the resume text supports it; gaps are stated, never faked. ----
  private jobMatch(input: Record<string, unknown>): AISuggestion[] {
    const jd = String(input.jobText ?? "").toLowerCase();
    const evidence = ((input.evidence as string[] | undefined) ?? []).map((e) => e.trim()).filter(Boolean);
    const evJoined = evidence.join(" • ").toLowerCase();
    const out: AISuggestion[] = [];

    for (const { skill, match } of SKILL_RULES) {
      const wanted = match.test(jd);
      const shown = evidence.find((e) => match.test(e));
      if (wanted && shown) out.push({ text: skill, rationale: shown, meta: { group: "strongMatches" } });
      else if (wanted && !shown && evJoined) out.push({ text: skill, rationale: "Not clearly evidenced in your resume yet.", meta: { group: "possibleGaps" } });
    }
    const soft = evidence.filter((e) => /helped|assisted|involved|part of/i.test(e))[0];
    if (soft) out.push({ text: "Relevant experience to sharpen", rationale: soft, meta: { group: "lookCloser" } });
    out.push({
      text: out.some((o) => o.meta?.group === "possibleGaps")
        ? "Address the gaps above with concrete examples if you have them."
        : "Mirror the job's language where your real evidence already fits.",
      meta: { group: "suggestions" },
    });
    return out;
  }

  // ---- INTERVIEW PREP: questions rooted in the user's own resume text. ----
  private interview(input: Record<string, unknown>): AISuggestion[] {
    const evidence = ((input.evidence as string[] | undefined) ?? []).map((e) => e.trim()).filter(Boolean);
    const out: AISuggestion[] = [];
    for (const e of evidence.slice(0, 4)) {
      out.push({ text: `Tell me more about when you ${lowerFirst(stripLead(e))}.`, meta: { group: "questions" } });
    }
    if (!out.length) out.push({ text: "Walk me through your most recent role.", meta: { group: "questions" } });
    out.push({ text: "Prepare a 60-second version of your story using your real experience.", meta: { group: "preparationPoints" } });
    out.push({ text: "Be ready to explain any gaps or short roles honestly.", meta: { group: "clarifications" } });
    out.push({ text: "What does success look like in this role in the first 90 days?", meta: { group: "candidateQuestions" } });
    return out;
  }

  // ---- Cover letter: a STRUCTURED DRAFT built only from what the user gave us.
  // Each suggestion is one paragraph (meta.part labels it). No invented company
  // facts, metrics, or claims — the user edits everything before it's real. ----
  private coverLetter(input: Record<string, unknown>): AISuggestion[] {
    const role = String(input.role ?? "").trim();
    const company = String(input.company ?? "").trim();
    const name = String(input.name ?? "").trim();
    const strengths = ((input.strengths as string[] | undefined) ?? [])
      .map((s) => s.trim())
      .filter(Boolean);
    const motivation = String(input.motivation ?? "").trim();

    const roleText = role || "the role";
    const companyText = company || "your team";
    const strengthList =
      strengths.length >= 2
        ? `${strengths.slice(0, -1).join(", ")} and ${strengths[strengths.length - 1]}`
        : strengths[0] ?? "";

    const opening = company
      ? `I'm writing to apply for ${roleText} at ${company}. ${motivation || `The role stood out to me, and I'd welcome the chance to contribute.`}`
      : `I'm writing to apply for ${roleText}. ${motivation || `The role stood out to me, and I'd welcome the chance to contribute.`}`;

    const body = strengthList
      ? `In my experience I've built strengths in ${strengthList}. I try to bring these to everything I take on, and I believe they line up well with what ${companyText} is looking for.`
      : `I bring a reliable, willing-to-learn approach to my work, and I'd put that to use for ${companyText} from day one.`;

    const closing = `Thank you for considering my application. I'd be glad to talk through how I could help ${companyText}, and I'm available at your convenience.${name ? `\n\nSincerely,\n${name}` : ""}`;

    return [
      { text: opening, meta: { part: "Opening" }, rationale: "Uses the role and company you entered." },
      { text: body, meta: { part: "Body" }, rationale: strengthList ? "Built from the strengths you listed." : "A neutral starting point — edit it to reflect your real strengths." },
      { text: closing, meta: { part: "Closing" } },
    ];
  }

  // ---- Prompt 5/6: role-appropriate responsibility suggestions ----
  private responsibilities(input: Record<string, unknown>): AISuggestion[] {
    const title = String(input.jobTitle ?? "").toLowerCase();
    const library: Record<string, string[]> = {
      "virtual assistant": [
        "Managed calendars and appointments",
        "Responded to routine emails and enquiries",
        "Maintained spreadsheets and digital records",
        "Prepared documents",
        "Coordinated meetings and follow-ups",
        "Conducted online research",
        "Organized files",
        "Supported day-to-day administration",
      ],
      "retail assistant": [
        "Served customers and answered questions",
        "Operated the till and handled payments",
        "Restocked shelves and organized displays",
        "Kept the shop floor clean and tidy",
        "Handled returns and exchanges",
        "Helped during busy periods",
      ],
      cashier: [
        "Processed customer payments accurately",
        "Handled cash and card transactions",
        "Answered customer questions",
        "Kept the checkout area tidy",
        "Balanced the till at the end of shifts",
      ],
      receptionist: [
        "Greeted visitors and answered the phone",
        "Booked and managed appointments",
        "Handled incoming and outgoing mail",
        "Kept the reception area organized",
        "Directed enquiries to the right people",
      ],
      "cafe crew": [
        "Prepared food and drinks to order",
        "Served customers at the counter",
        "Handled payments",
        "Kept the work area clean and hygienic",
        "Worked quickly during busy periods",
      ],
    };
    const match =
      Object.entries(library).find(([k]) => title.includes(k))?.[1] ??
      [
        "Completed daily tasks reliably",
        "Followed instructions and procedures",
        "Worked as part of a team",
        "Communicated with customers or colleagues",
        "Kept the work area organized",
      ];
    return match.map((text) => ({ text }));
  }

  // ---- Prompt 10: skills evidenced by confirmed responsibilities/activities ----
  private skills(input: Record<string, unknown>): AISuggestion[] {
    // Accept both the legacy `confirmedStatements` and the richer source-tagged form.
    const statements = (input.confirmedStatements as string[] | undefined) ?? [];
    const tagged = (input.evidence as { text: string; source?: string }[] | undefined) ?? [];
    const items: { text: string; source: string }[] = [
      ...statements.map((t) => ({ text: t, source: "experience" })),
      ...tagged.map((e) => ({ text: e.text, source: e.source ?? "experience" })),
    ];
    const found = new Map<string, { evidence: string; source: string }>();
    for (const it of items) {
      for (const { skill, match } of SKILL_RULES) {
        if (match.test(it.text) && !found.has(skill)) found.set(skill, { evidence: it.text, source: it.source });
      }
    }
    // Evidence-backed only — do not inflate (Prompt 10).
    return [...found.entries()].map(([skill, { evidence, source }]) => ({
      text: skill,
      rationale: evidence,
      meta: { source, confidence: "medium" },
    }));
  }

  // ---- Prompt 13: 2-3 summary styles from confirmed info only ----
  private summaries(input: Record<string, unknown>): AISuggestion[] {
    const role = String(input.targetRole ?? "a new role");
    const level = String(input.level ?? "beginner");
    const strengths = ((input.strengths as string[] | undefined) ?? []).slice(0, 3);
    const strengthText = strengths.length ? strengths.join(", ").toLowerCase() : "reliability and a willingness to learn";

    if (level === "experienced") {
      return [
        { text: `Experienced professional targeting ${role}, with hands-on strengths in ${strengthText}.`, meta: { style: "Professional" } },
        { text: `Motivated ${role} candidate who brings ${strengthText} and a focus on getting things done.`, meta: { style: "Confident" } },
        { text: `${capitalize(role)} candidate with practical experience in ${strengthText}.`, meta: { style: "Simple" } },
      ];
    }
    return [
      { text: `Motivated candidate seeking ${role}. Brings ${strengthText}, and a genuine willingness to learn on the job.`, meta: { style: "Professional" } },
      { text: `Eager to start in ${role}. Known for ${strengthText}, and ready to contribute from day one.`, meta: { style: "Confident" } },
      { text: `Looking for ${role}. Reliable, quick to learn, with ${strengthText}.`, meta: { style: "Simple" } },
    ];
  }

  private achievement(input: Record<string, unknown>): AISuggestion[] {
    const raw = String(input.description ?? "").trim();
    if (!raw) return [];
    // Optimize wording, not reality — no invented metrics.
    return [
      { text: capitalize(raw.replace(/^i\s+/i, "").trim()) },
    ];
  }
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}

function lowerFirst(s: string): string {
  return s.length ? s[0].toLowerCase() + s.slice(1) : s;
}

// Strip a leading first-person verb so "Served customers" -> "served customers"
// reads naturally inside a question. Purely cosmetic; no facts change.
function stripLead(s: string): string {
  return s.replace(/^(i\s+|we\s+)/i, "").trim();
}

// Quote a short window of the user's own text as evidence — never paraphrased into a
// claim the user didn't make.
function quoteEvidence(text: string, at: number): string {
  const start = Math.max(0, at - 0);
  const slice = text.slice(start, start + 90).trim();
  return slice.length < text.length ? `${slice}…` : slice;
}

// One evidence-rule table shared by skill discovery, look-closer and job match, so all
// three surfaces agree on what counts as evidence. `why` explains the connection.
const SKILL_RULES: { skill: string; match: RegExp; why: string }[] = [
  { skill: "Customer Service", match: /customer|served|serving|enquir|client|guest/i, why: "Direct interaction with customers." },
  { skill: "Communication", match: /email|phone|answer|greet|communicat|explain|liais/i, why: "Regular communication with people." },
  { skill: "Teamwork", match: /team|colleague|coworker|help(ed|ing)?|support|collaborat/i, why: "Working alongside or supporting others." },
  { skill: "Training & Mentoring", match: /train(ed|ing)?|mentor|onboard|show(ed)? new|taught/i, why: "Helping others learn the role." },
  { skill: "Time Management", match: /busy|deadline|on time|schedule|shift|fast[- ]paced|prioriti/i, why: "Working under time pressure." },
  { skill: "Cash Handling", match: /cash|payment|till|checkout|transaction|register/i, why: "Handling money or payments." },
  { skill: "Calendar Management", match: /calendar|appointment|booking|meeting|diary/i, why: "Coordinating time and appointments." },
  { skill: "Microsoft Excel", match: /spreadsheet|excel/i, why: "Working with spreadsheets." },
  { skill: "Data Entry", match: /record|data|spreadsheet|file|logg(ed|ing)/i, why: "Recording or entering information." },
  { skill: "Organization", match: /organiz|tidy|file|arrang|stock|inventory/i, why: "Keeping things ordered." },
  { skill: "Problem Solving", match: /resolv|fix|troublesho|handled (a )?(issue|problem|complaint)/i, why: "Resolving issues as they came up." },
];
