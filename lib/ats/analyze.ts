// ============================================================================
// ATS readability analyzer — deterministic, transparent, offline.
//
// Honesty rules (from the brief):
//   • Never claims a resume "will pass ATS". We surface common readability and
//     relevance issues only.
//   • Every number is COMPUTED from the text in front of us — no invented
//     percentages. The keyword score only appears when a job description is
//     actually provided, and it's a real term-overlap ratio.
//   • Runs entirely in the browser. Nothing is uploaded or stored server-side.
// ============================================================================

export type CheckStatus = "good" | "warn" | "risk";

export type CheckResult = {
  id: string;
  label: string;
  status: CheckStatus;
  /** Plain-language finding — what we saw. */
  detail: string;
  /** Actionable next step, when there's something to improve. */
  suggestion?: string;
};

export type AtsReport = {
  /** Real ratio: checks at "good" ÷ total checks, 0–100, rounded. */
  readinessScore: number;
  checksPassed: number;
  checksTotal: number;
  /** Only present when a job description was supplied. */
  keywordMatch?: {
    percent: number;
    matched: string[];
    missing: string[];
  };
  strengths: CheckResult[];
  issues: CheckResult[];
  suggestions: string[];
  wordCount: number;
};

const STANDARD_HEADINGS = [
  "experience",
  "work experience",
  "employment",
  "education",
  "skills",
  "summary",
  "profile",
  "projects",
  "certifications",
  "volunteer",
];

// Common strong action verbs — presence at the start of bullet-like lines is a
// readability/clarity signal, not a guarantee of anything.
const ACTION_VERBS = [
  "led","built","created","designed","developed","managed","launched","improved",
  "increased","reduced","delivered","organized","organised","coordinated","analyzed",
  "analysed","implemented","achieved","won","grew","supported","trained","handled",
  "resolved","planned","produced","wrote","taught","sold","served","maintained",
  "streamlined","negotiated","researched","tested","automated","mentored","owned",
];

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","for","to","of","in","on","at","by","with","from",
  "as","is","are","was","were","be","been","being","this","that","these","those","it",
  "we","you","your","our","their","they","he","she","will","would","can","could","should",
  "have","has","had","do","does","did","not","no","yes","if","then","than","so","such",
  "into","out","up","down","over","under","about","who","what","when","where","which",
  "role","job","work","team","company","looking","strong","excellent","ability","must",
  "years","year","experience","required","preferred","plus","etc","including","across",
]);

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Extract meaningful candidate keywords from a job description. */
function extractKeywords(jd: string): string[] {
  const words = normalizeWords(jd).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);
  // Keep the most frequent distinct terms — real signal from the posting.
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([w]) => w)
    .slice(0, 25);
}

export function analyzeResume(resumeText: string, jobDescription = ""): AtsReport {
  const text = resumeText.trim();
  const lower = text.toLowerCase();
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const nonEmptyLines = lines.filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const strengths: CheckResult[] = [];
  const issues: CheckResult[] = [];

  const record = (r: CheckResult) => {
    if (r.status === "good") strengths.push(r);
    else issues.push(r);
  };

  // 1. Contact information -----------------------------------------------
  const hasEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(text);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  record({
    id: "contact",
    label: "Contact information",
    status: hasEmail && hasPhone ? "good" : hasEmail || hasPhone ? "warn" : "risk",
    detail:
      hasEmail && hasPhone
        ? "An email address and phone number are both present."
        : hasEmail
          ? "An email is present, but we couldn't find a phone number."
          : hasPhone
            ? "A phone number is present, but we couldn't find an email."
            : "We couldn't find an email address or phone number.",
    suggestion:
      hasEmail && hasPhone
        ? undefined
        : "Add a clear email and phone number near the top as plain text (not inside a header image or text box).",
  });

  // 2. Standard section headings -----------------------------------------
  const foundHeadings = STANDARD_HEADINGS.filter((h) =>
    new RegExp(`(^|\\n)\\s*${h}\\b`, "i").test(lower),
  );
  const uniqueHeadingGroups = new Set(
    foundHeadings.map((h) =>
      /experience|employment/.test(h) ? "experience" : /summary|profile/.test(h) ? "summary" : h,
    ),
  );
  record({
    id: "headings",
    label: "Section headings",
    status: uniqueHeadingGroups.size >= 3 ? "good" : uniqueHeadingGroups.size >= 1 ? "warn" : "risk",
    detail:
      uniqueHeadingGroups.size >= 3
        ? `Recognisable headings found (${[...uniqueHeadingGroups].join(", ")}).`
        : uniqueHeadingGroups.size >= 1
          ? `Only some standard headings were found (${[...uniqueHeadingGroups].join(", ")}).`
          : "We couldn't detect standard section headings like Experience, Education or Skills.",
    suggestion:
      uniqueHeadingGroups.size >= 3
        ? undefined
        : "Use plain, conventional headings (Experience, Education, Skills). Parsers rely on them to sort your content.",
  });

  // 3. Length ------------------------------------------------------------
  record({
    id: "length",
    label: "Length",
    status: wordCount >= 250 && wordCount <= 900 ? "good" : wordCount < 120 ? "risk" : "warn",
    detail:
      wordCount < 120
        ? `The resume is very short (${wordCount} words). There may not be enough detail to assess.`
        : wordCount > 900
          ? `The resume is long (${wordCount} words), which can bury your strongest points.`
          : `Length looks reasonable (${wordCount} words).`,
    suggestion:
      wordCount >= 250 && wordCount <= 900
        ? undefined
        : wordCount < 120
          ? "Expand each role with a few concrete bullet points describing what you did and the result."
          : "Trim older or less relevant detail so your best, most recent work stands out.",
  });

  // 4. Parsing / formatting risks ----------------------------------------
  const hasTabs = /\t/.test(text);
  const hasPipeColumns = nonEmptyLines.filter((l) => (l.match(/\|/g) ?? []).length >= 2).length >= 2;
  const oddChars = (text.match(/[│┃▪◦■♦●➤»]/g) ?? []).length;
  const parsingRisk = hasTabs || hasPipeColumns || oddChars > 3;
  record({
    id: "parsing",
    label: "Parsing & formatting risks",
    status: parsingRisk ? "risk" : "good",
    detail: parsingRisk
      ? "We spotted signs of tables, columns or unusual symbols that some parsers mishandle."
      : "No obvious table, column or unusual-symbol markers were detected in the text.",
    suggestion: parsingRisk
      ? "Prefer a single-column layout with standard bullets (•) and avoid tables or text boxes for key content."
      : undefined,
  });

  // 5. Experience clarity — action verbs & quantified results ------------
  const bulletLines = nonEmptyLines.filter((l) => /^[-•*–]/.test(l) || /^[A-Z][a-z]+ed\b/.test(l));
  const startsWithVerb = nonEmptyLines.filter((l) => {
    const first = l.replace(/^[-•*–]\s*/, "").split(/\s+/)[0]?.toLowerCase() ?? "";
    return ACTION_VERBS.includes(first);
  }).length;
  record({
    id: "clarity",
    label: "Experience clarity",
    status: startsWithVerb >= 3 ? "good" : startsWithVerb >= 1 ? "warn" : "risk",
    detail:
      startsWithVerb >= 3
        ? `Several lines begin with strong action verbs (${startsWithVerb} found).`
        : startsWithVerb >= 1
          ? "A few lines start with action verbs, but most don't."
          : "Few or no lines begin with action verbs.",
    suggestion:
      startsWithVerb >= 3
        ? undefined
        : "Start each bullet with an action verb (Led, Built, Improved…) so achievements read clearly.",
  });

  const quantified = (text.match(/\b\d+([.,]\d+)?\s*(%|percent|k|m|\+|hours?|people|clients?|customers?|\$)/gi) ?? []).length
    + (text.match(/[$€£]\s?\d/g) ?? []).length;
  record({
    id: "impact",
    label: "Quantified impact",
    status: quantified >= 2 ? "good" : quantified === 1 ? "warn" : "warn",
    detail:
      quantified >= 2
        ? `Some results are quantified (${quantified} figures found).`
        : "Little or no quantified impact (numbers, %, amounts) was detected.",
    suggestion:
      quantified >= 2
        ? undefined
        : "Where you can, add numbers: how many, how much, how often, or the before/after result.",
  });

  // 6. Keyword relevance (only when a JD is provided) --------------------
  let keywordMatch: AtsReport["keywordMatch"] | undefined;
  if (jobDescription.trim().length > 40) {
    const keywords = extractKeywords(jobDescription);
    const resumeWordSet = new Set(normalizeWords(text));
    const matched = keywords.filter((k) => resumeWordSet.has(k));
    const missing = keywords.filter((k) => !resumeWordSet.has(k));
    const percent = keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0;
    keywordMatch = { percent, matched, missing };
    record({
      id: "keywords",
      label: "Keyword relevance",
      status: percent >= 60 ? "good" : percent >= 30 ? "warn" : "risk",
      detail: `Your resume includes ${matched.length} of ${keywords.length} frequent terms from the job description (${percent}%).`,
      suggestion:
        percent >= 60
          ? undefined
          : `Where they're genuinely true of you, weave in relevant terms — e.g. ${missing.slice(0, 6).join(", ")}.`,
    });
  }

  const checksTotal = strengths.length + issues.length;
  const checksPassed = strengths.length;
  const readinessScore = checksTotal ? Math.round((checksPassed / checksTotal) * 100) : 0;

  const suggestions = issues
    .map((i) => i.suggestion)
    .filter((s): s is string => Boolean(s));

  return {
    readinessScore,
    checksPassed,
    checksTotal,
    keywordMatch,
    strengths,
    issues,
    suggestions,
    wordCount,
  };
}
