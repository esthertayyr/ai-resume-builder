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
      default:
        return { suggestions: [] };
    }
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
    const statements = (input.confirmedStatements as string[] | undefined) ?? [];
    const rules: { skill: string; match: RegExp }[] = [
      { skill: "Customer Service", match: /customer|served|enquir|client/i },
      { skill: "Communication", match: /email|phone|answer|greet|communicat/i },
      { skill: "Teamwork", match: /team|colleague|help(ed)? |support/i },
      { skill: "Time Management", match: /busy|deadline|on time|schedule|shift/i },
      { skill: "Calendar Management", match: /calendar|appointment|booking|meeting/i },
      { skill: "Microsoft Excel", match: /spreadsheet|excel/i },
      { skill: "Data Entry", match: /record|data|spreadsheet|file/i },
      { skill: "Cash Handling", match: /cash|payment|till|checkout/i },
      { skill: "Organization", match: /organiz|tidy|file|arrang/i },
    ];
    const found = new Map<string, string>(); // skill -> evidence statement
    for (const s of statements) {
      for (const { skill, match } of rules) {
        if (match.test(s) && !found.has(skill)) found.set(skill, s);
      }
    }
    // Evidence-backed only — do not inflate (Prompt 10).
    return [...found.entries()].map(([skill, evidence]) => ({
      text: skill,
      rationale: `Suggested because you mentioned "${evidence}"`,
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
