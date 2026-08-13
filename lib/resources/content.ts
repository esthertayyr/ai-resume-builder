// ============================================================================
// Resource / content architecture.
//
// Honesty rules (from the brief):
//   • No fake authors — articles are attributed to the organisation ("The
//     Annotated Career"), never to invented people.
//   • No fake publication dates — `publishedAt`/`updatedAt` are OPTIONAL and left
//     undefined until a real date exists. The UI simply omits the byline date.
//   • Reading time is COMPUTED from the body word count, not made up.
//
// The shape is deliberately SEO-friendly: stable category + slug URLs, per-article
// title/description, and structured body blocks a single template renders. New
// articles are added as data — no new components required.
// ============================================================================

export type CategorySlug =
  | "resumes"
  | "ats"
  | "interviews"
  | "job-search"
  | "internships"
  | "remote-work"
  | "virtual-assistant"
  | "applications"
  | "career-stories";

export type Category = {
  slug: CategorySlug;
  name: string;
  blurb: string;
};

export const CATEGORIES: Category[] = [
  { slug: "resumes", name: "Resumes", blurb: "Write, structure and strengthen a resume." },
  { slug: "ats", name: "ATS", blurb: "How applicant tracking systems read your resume." },
  { slug: "interviews", name: "Interviews", blurb: "Prepare for the questions employers ask." },
  { slug: "job-search", name: "Job Search", blurb: "Find roles and manage your applications." },
  { slug: "internships", name: "Internships", blurb: "First resumes and early-career roles." },
  { slug: "remote-work", name: "Remote Work", blurb: "Find and win remote roles." },
  { slug: "virtual-assistant", name: "Virtual Assistant", blurb: "Build a VA service and niche." },
  { slug: "applications", name: "Applications", blurb: "Emails, follow-ups and thank-you notes." },
  { slug: "career-stories", name: "Career Stories", blurb: "How real experience becomes a career." },
];

// Body blocks — a small, safe set a single renderer understands.
export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] };

export type RelatedLink = { label: string; href: string };

export type Article = {
  slug: string;
  category: CategorySlug;
  title: string;
  description: string;
  /** Organisation attribution — never an invented person. */
  author: "The Annotated Career";
  /** Optional; undefined until a real date exists (no fabricated dates). */
  publishedAt?: string;
  updatedAt?: string;
  body: Block[];
  related: RelatedLink[];
};

function words(body: Block[]): number {
  return body.reduce((n, b) => {
    if (b.type === "ul") return n + b.items.join(" ").split(/\s+/).filter(Boolean).length;
    return n + b.text.split(/\s+/).filter(Boolean).length;
  }, 0);
}

/** Real reading-time estimate from the body (≈200 wpm), minimum 1 minute. */
export function readingMinutes(article: Article): number {
  return Math.max(1, Math.round(words(article.body) / 200));
}

const ORG = "The Annotated Career" as const;

export const ARTICLES: Article[] = [
  {
    slug: "what-counts-as-experience",
    category: "career-stories",
    title: "What actually counts as experience",
    description:
      "You have more experience than you think. Here's how to recognise the real, resume-worthy experience hiding in ordinary life.",
    author: ORG,
    body: [
      { type: "p", text: "Most people underestimate their own experience because they only count jobs with a formal title. But experience is really just situations where you did something that mattered — and those are everywhere." },
      { type: "h2", text: "Experience is a situation, not a job title" },
      { type: "p", text: "If you organised a family event, kept a group project on track, or handled a difficult customer, you were building skills an employer values. The task is to notice those moments and describe them plainly." },
      { type: "ul", items: [
        "School and course projects — planning and follow-through",
        "Volunteering — reliability and initiative",
        "Part-time or informal work — customer service and time management",
        "Family responsibilities — dependability and organisation",
      ] },
      { type: "h2", text: "Turn a moment into a resume line" },
      { type: "p", text: "Name what you did, how you did it, and what came of it. \"Coordinated a charity bake sale that raised funds for the school\" is a real, honest line — no exaggeration needed." },
    ],
    related: [
      { label: "Start your Career Journey", href: "/journey" },
      { label: "Build a resume", href: "/resume/builder" },
    ],
  },
  {
    slug: "resume-with-no-experience",
    category: "resumes",
    title: "How to write a resume with no experience",
    description:
      "No formal work history? You can still write a strong, honest resume. Here's what to include and how to structure it.",
    author: ORG,
    body: [
      { type: "p", text: "A first resume isn't empty — it's just organised differently. Lead with what you do have: education, projects, activities and transferable skills." },
      { type: "h2", text: "Sections that work when experience is thin" },
      { type: "ul", items: [
        "Education — your most recent and relevant study",
        "Projects — school, personal or technical work",
        "Leadership & activities — clubs, teams, roles you took on",
        "Volunteering — anything you gave your time to",
        "Skills — practical and honest, not padded",
      ] },
      { type: "h2", text: "Describe, don't inflate" },
      { type: "p", text: "Employers hiring for entry-level roles expect you to be early on. Clear, truthful descriptions beat impressive-sounding ones you can't back up in an interview." },
    ],
    related: [
      { label: "Internship & first resume builder", href: "/internship" },
      { label: "Check your resume for ATS issues", href: "/resume/ats" },
    ],
  },
  {
    slug: "what-is-an-ats",
    category: "ats",
    title: "What is an ATS, and why should you care?",
    description:
      "An applicant tracking system often reads your resume before a person does. Here's how it works and how to stay readable.",
    author: ORG,
    body: [
      { type: "p", text: "An Applicant Tracking System (ATS) is software many employers use to collect and search resumes. When you apply online, your resume often lands in an ATS first." },
      { type: "h2", text: "What trips an ATS up" },
      { type: "ul", items: [
        "Tables and multiple columns that scramble the reading order",
        "Important details hidden in headers, footers or images",
        "Unusual section names instead of Experience, Education, Skills",
        "Heavy graphics where plain text would do",
      ] },
      { type: "h2", text: "Staying readable" },
      { type: "p", text: "A clean, single-column layout with standard headings is easier for both the software and the human who reads it next. No honest tool can promise your resume will \"pass\" — but you can remove the things that commonly get in the way." },
    ],
    related: [
      { label: "Run the ATS checker", href: "/resume/ats" },
      { label: "Build an ATS-friendly resume", href: "/resume/builder" },
    ],
  },
  {
    slug: "tell-me-about-yourself",
    category: "interviews",
    title: "How to answer “Tell me about yourself”",
    description:
      "The most common interview opener, and how to give a short, relevant answer that sets the right tone.",
    author: ORG,
    body: [
      { type: "p", text: "\"Tell me about yourself\" isn't an invitation to recite your life story. It's a chance to give a focused, 30–60 second summary of why you're a fit." },
      { type: "h2", text: "A simple structure" },
      { type: "ul", items: [
        "Who you are professionally, in a sentence",
        "One or two strengths relevant to this role",
        "Why you're here — what draws you to this job",
      ] },
      { type: "p", text: "Keep personal detail brief. End by pointing forward to the role, so the conversation has somewhere natural to go." },
    ],
    related: [
      { label: "Practise interview questions", href: "/interview/prep" },
    ],
  },
  {
    slug: "job-application-email",
    category: "applications",
    title: "Writing a job application email that gets read",
    description:
      "A short, clear application email does more than a long one. Here's a structure you can adapt for any role.",
    author: ORG,
    body: [
      { type: "p", text: "When you email an application, the reader is busy. Make it easy to see who you are, what you're applying for, and what's attached." },
      { type: "h2", text: "What to include" },
      { type: "ul", items: [
        "A clear subject line with the role name",
        "A one-line greeting and the role you're applying for",
        "Two or three sentences on why you're a fit",
        "A note of what's attached (resume, cover letter)",
        "A polite sign-off with your contact details",
      ] },
      { type: "p", text: "Keep it tailored to the specific role. A message that reads like it was sent to fifty employers tends to be treated like it was." },
    ],
    related: [
      { label: "Build a focused cover letter", href: "/cover-letter" },
    ],
  },
  {
    slug: "thank-you-email-after-interview",
    category: "applications",
    title: "Sending a thank-you email after an interview",
    description:
      "A brief, genuine thank-you note after an interview is a small step that leaves a good impression.",
    author: ORG,
    body: [
      { type: "p", text: "A short thank-you email within a day of your interview shows courtesy and keeps you fresh in the interviewer's mind." },
      { type: "h2", text: "Keep it short and specific" },
      { type: "ul", items: [
        "Thank them for their time",
        "Mention one thing from the conversation you found interesting",
        "Reaffirm your interest in the role, briefly",
      ] },
      { type: "p", text: "Three or four sentences is plenty. Sincerity matters more than length." },
    ],
    related: [
      { label: "Prepare for the interview", href: "/interview/prep" },
    ],
  },
  {
    slug: "finding-remote-work",
    category: "remote-work",
    title: "Finding remote work when you're starting out",
    description:
      "Remote roles are competitive, but reachable. Here's how to position yourself and where to focus your search.",
    author: ORG,
    body: [
      { type: "p", text: "Remote work rewards people who can communicate clearly and manage their own time. If you can show those, you're already speaking the language remote employers care about." },
      { type: "h2", text: "Show you can work remotely" },
      { type: "ul", items: [
        "Clear written communication in your application itself",
        "Examples of self-directed work or study",
        "Comfort with common tools (email, docs, video calls)",
      ] },
      { type: "p", text: "Start with roles that match skills you already have, and be honest about your level. A focused application for a role you fit beats a scattershot approach every time." },
    ],
    related: [
      { label: "Build your resume", href: "/resume/builder" },
    ],
  },
  {
    slug: "becoming-a-virtual-assistant",
    category: "virtual-assistant",
    title: "Becoming a virtual assistant: finding your niche",
    description:
      "Virtual assistance is a real path into remote work. Choosing a niche helps you stand out and price your time.",
    author: ORG,
    body: [
      { type: "p", text: "A virtual assistant (VA) supports businesses remotely — admin, scheduling, inbox management, research and more. The people who do well tend to specialise." },
      { type: "h2", text: "Why a niche helps" },
      { type: "ul", items: [
        "You become the obvious choice for a specific kind of client",
        "You can describe your service clearly instead of \"a bit of everything\"",
        "You build relevant experience faster",
      ] },
      { type: "p", text: "Start from what you already know or enjoy — a hobby, an industry, a tool you're good with — and build your service around it." },
    ],
    related: [
      { label: "Discover your skills", href: "/journey" },
    ],
  },
];

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function articlesInCategory(slug: CategorySlug): Article[] {
  return ARTICLES.filter((a) => a.category === slug);
}
