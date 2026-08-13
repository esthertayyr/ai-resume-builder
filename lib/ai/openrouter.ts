// Server-only OpenRouter provider. Selected via AI_PROVIDER=openrouter. The key is
// read from server env and NEVER sent to the client (this module is only imported by
// the /api/ai route + tests). The model is configurable (OPENROUTER_MODEL).
//
// Uses OpenRouter's OpenAI-compatible Chat Completions API. Every task returns the
// single validated wire shape {"suggestions":[{text,rationale,meta}]} — task-specific
// structure is carried in `meta` and reshaped by lib/ai/service.ts. The model is told,
// per task, to quote the user's own words as evidence and to invent NOTHING.
//
// On a real failure (auth / rate limit / timeout / network / unusable output after a
// bounded retry) we throw AIUnavailableError rather than silently returning fabricated
// suggestions. The route maps that to a friendly message; the mock provider is only
// used when AI_PROVIDER=mock.
import type { AIProvider, AIRequest, AIResponse } from "./provider";
import { AI_LIMITS, AIUnavailableError } from "./provider";
import { safeParseAIResponse } from "./schema";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export class OpenRouterProvider implements AIProvider {
  constructor(
    private readonly apiKey: string = process.env.OPENROUTER_API_KEY ?? "",
    private readonly model: string = process.env.OPENROUTER_MODEL ?? "",
  ) {}

  async complete(req: AIRequest): Promise<AIResponse> {
    // Missing config is an operational failure, not a silent fabrication.
    if (!this.apiKey || !this.model) throw new AIUnavailableError("unavailable");

    let lastKind: "rate_limited" | "unavailable" = "unavailable";
    for (let attempt = 0; attempt < AI_LIMITS.maxAttempts; attempt++) {
      try {
        const raw = await this.callModel(req, attempt > 0);
        const parsed = safeParseAIResponse(raw);
        if (parsed) return parsed;
        // Parsed JSON but wrong shape → treat as a soft failure and retry once.
        lastKind = "unavailable";
      } catch (err) {
        lastKind = err instanceof AIUnavailableError ? err.kind : "unavailable";
        // Do not hammer a rate-limited free model: stop retrying on 429/auth.
        if (lastKind === "rate_limited") break;
      }
      // Bounded exponential backoff between attempts (never an aggressive loop).
      if (attempt + 1 < AI_LIMITS.maxAttempts) await sleep(400 * (attempt + 1));
    }
    throw new AIUnavailableError(lastKind);
  }

  private async callModel(req: AIRequest, strict: boolean): Promise<unknown> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_LIMITS.timeoutMs);
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          // OpenRouter attribution headers (optional, non-secret).
          "HTTP-Referer": "https://theannotatedcareer.com",
          "X-Title": "The Annotated Career",
        },
        body: JSON.stringify({
          model: this.model,
          messages: buildMessages(req, strict),
          response_format: { type: "json_object" },
          max_tokens: AI_LIMITS.maxOutputTokens,
          temperature: 0.4,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Map transport errors to a coarse kind; never surface raw provider text.
        if (res.status === 429) throw new AIUnavailableError("rate_limited");
        throw new AIUnavailableError("unavailable"); // 401/403/500/etc.
      }

      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      return JSON.parse(content); // may throw on invalid JSON → caught by complete()
    } catch (err) {
      if (err instanceof AIUnavailableError) throw err;
      // AbortError (timeout), network failure, or JSON.parse failure.
      throw new AIUnavailableError("unavailable");
    } finally {
      clearTimeout(timer);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Prompting. One firm system rule (never invent), plus a task-specific instruction
// that defines exactly what to put in text/rationale/meta. All output is the same
// validated wire shape, so the route's schema check is authoritative regardless.
// ---------------------------------------------------------------------------
const NEVER_INVENT =
  "You are a careful career editor for a product called The Annotated Career. You help " +
  "people LOOK CLOSER at experience they already have. You NEVER invent employers, job " +
  "titles, dates, numbers, percentages, revenue, team sizes, achievements, metrics, " +
  "qualifications, certifications, credential numbers, or skills that lack evidence in " +
  "the user's own text. Prefer omission over guessing. Quote the user's words as " +
  "evidence. You only ever return SUGGESTIONS the user must confirm.";

const SHAPE =
  'Respond with ONLY a JSON object of the exact form {"suggestions":[{"text":"...",' +
  '"rationale":"...","meta":{...}}]}. No prose, no markdown, no code fences, no HTML.';

const TASK_GUIDE: Record<string, string> = {
  look_closer:
    "TASK: Analyse ONE experience entry. For each real skill it evidences, add a " +
    'suggestion where text=skill name, rationale=a short quote of the user\'s own words, ' +
    'meta={"kind":"finding","explanation":"why this shows the skill","confidence":"high|medium|low"}. ' +
    "If the text is too thin to support anything, return an empty suggestions array.",
  skills_discovery:
    "TASK: Identify skills evidenced across the provided resume text. text=skill, " +
    'rationale=the supporting evidence quote, meta={"source":"experience|project|education|certification|achievement","confidence":"high|medium|low"}. ' +
    "Every skill MUST have evidence. No generic skill lists.",
  achievement_wording:
    "TASK: Rewrite ONE resume line more strongly WITHOUT changing its factual meaning. " +
    "Give up to 3 alternatives (professional, action-oriented, concise). text=rewrite, " +
    'rationale=why it is stronger, meta={"style":"professional|stronger|concise"}. Add no new facts.',
  responsibility_suggestions:
    "TASK: Suggest plausible, generic responsibilities for the given job title as neutral " +
    "starting points the user must confirm. text=responsibility. No employer-specific claims.",
  summary_options:
    "TASK: Write up to 3 professional summaries using ONLY the provided info. " +
    'text=summary, meta={"style":"concise|professional|personal"}. No invented claims or buzzword padding.',
  cover_letter:
    "TASK: Draft a concise cover letter in 3 parts using ONLY provided info. text=paragraph, " +
    'meta={"part":"opening|body|closing"}. Invent no company facts, metrics, or relationships.',
  resume_review:
    "TASK: Review the structured resume like an editor. For each finding: text=the issue, " +
    'rationale=a concrete suggestion, meta={"category":"look_closer|needs_evidence|already_strong|optional_improvement",' +
    '"section":"which section","priority":"high|medium|low"}. Do NOT rewrite the resume.',
  job_match:
    "TASK: Compare the resume evidence to the job description. text=the point, rationale=the " +
    'supporting resume evidence (or why it is missing), meta={"group":"strongMatches|lookCloser|possibleGaps|suggestions"}. ' +
    "Never claim a skill the resume does not evidence. Never tell the user to falsely claim anything.",
  interview_prep:
    "TASK: From the resume (and optional job description) produce interview prep. text=the item, " +
    'meta={"group":"questions|preparationPoints|clarifications|candidateQuestions"}. Ground questions in the user\'s real experience.',
  extract_resume: "TASK: Return an empty suggestions array.",
};

function buildMessages(req: AIRequest, strict: boolean) {
  const guide = TASK_GUIDE[req.task] ?? "TASK: Return suggestions only.";
  const system = `${NEVER_INVENT} ${guide} ${SHAPE}${
    strict ? " Your previous reply was not valid JSON — return valid JSON only." : ""
  }`;
  return [
    { role: "system", content: system },
    { role: "user", content: `Input: ${JSON.stringify(req.input)}` },
  ];
}
