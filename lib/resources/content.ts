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
  {
    slug: "first-resume",
    category: "resumes",
    title: "Your first resume: a step-by-step guide",
    description:
      "Never written a resume before? Start here. A calm, honest walk from a blank page to a resume you'd be proud to send.",
    author: ORG,
    body: [
      { type: "p", text: "A first resume feels intimidating because it looks like proof you're supposed to already have. You're not. A resume is just an organised account of what you've done and what you can do — and you have more of both than a blank page suggests." },
      { type: "h2", text: "Start with experience, not the layout" },
      { type: "p", text: "Before you touch fonts or templates, make a list. Every job, project, class, club, volunteer shift and responsibility you've held. Don't filter yet — the point is to see the raw material. Looking after younger siblings, running a group chat for an event, finishing a course: it all counts as experience at this stage." },
      { type: "h2", text: "Turn each one into evidence" },
      { type: "p", text: "Experience becomes evidence when you can say what you actually did. For each item, write one plain sentence: what was the task, what did you do, what came of it? \"Managed the sign-up sheet for a 40-person event\" is evidence. \"Good with people\" is not — yet." },
      { type: "ul", items: [
        "Name the situation in a few words",
        "Say what you did, using a real verb (organised, fixed, taught, tracked)",
        "Add the result if you have one — even a small, honest one",
      ] },
      { type: "h2", text: "Name the skill underneath" },
      { type: "p", text: "Each piece of evidence points to a skill. The sign-up sheet shows organisation and reliability. A group project you kept on track shows coordination. Write the skills down as you spot them — that list becomes your Skills section, and it's honest because every entry traces back to something you actually did." },
      { type: "h2", text: "Shape it into a story" },
      { type: "p", text: "Now choose an order. When you're early in your career, lead with education and projects, then activities and any work. Standard section headings — Education, Projects, Experience, Skills — read cleanly for both people and the software many employers use. Keep it to one page and one column." },
      { type: "h2", text: "Your next move" },
      { type: "p", text: "Draft it, read it aloud once, and cut anything you couldn't explain in an interview. Then send it. A truthful first resume that you can stand behind beats an impressive one you can't." },
    ],
    related: [
      { label: "Build your first resume", href: "/internship" },
      { label: "What actually counts as experience", href: "/resources/career-stories/what-counts-as-experience" },
      { label: "Check it for ATS issues", href: "/resume/ats" },
    ],
  },
  {
    slug: "discover-skills",
    category: "career-stories",
    title: "How to discover the skills you already have",
    description:
      "You've built more skills than you can name. Here's a simple way to find them in the things you've already done.",
    author: ORG,
    body: [
      { type: "p", text: "Most people can't list their own skills — not because they don't have any, but because skills are invisible from the inside. When something comes easily, you assume it's easy for everyone. It usually isn't. The way to find your skills is to look closer at what you've already done." },
      { type: "h2", text: "Start with experience you take for granted" },
      { type: "p", text: "Think back over the last few years — jobs, study, home, side projects, helping people out. Write down the moments where you were the one who sorted something out. The ordinary ones matter most, because those are the habits you'll carry into any role." },
      { type: "h2", text: "Read each moment as evidence" },
      { type: "p", text: "Take one moment and ask: what did doing this actually require? Planning a trip for friends required budgeting, scheduling and negotiation. Fixing a recurring problem at work required noticing a pattern and following through. The evidence is in the doing, not in a certificate." },
      { type: "ul", items: [
        "What did I have to figure out?",
        "What did other people rely on me for?",
        "What would have gone wrong if I hadn't done it?",
      ] },
      { type: "h2", text: "Name the skill honestly" },
      { type: "p", text: "Give each one a plain name — communication, problem-solving, organisation, patience, attention to detail. Resist the urge to inflate. \"Led a team\" and \"kept a group of friends organised\" are different claims; use the one you can back up." },
      { type: "h2", text: "Let the skills tell a story" },
      { type: "p", text: "Patterns appear once you have a list. Maybe you keep ending up as the reliable organiser, or the one who's calm under pressure. That pattern is the beginning of how you'll describe yourself — in a resume, a cover letter, or an interview." },
      { type: "h2", text: "Your next move" },
      { type: "p", text: "Keep the list somewhere you can add to it. Skills aren't fixed, and the point isn't a perfect inventory — it's to stop underselling yourself the next time someone asks what you're good at." },
    ],
    related: [
      { label: "Start your Career Journey", href: "/journey" },
      { label: "What actually counts as experience", href: "/resources/career-stories/what-counts-as-experience" },
    ],
  },
  {
    slug: "career-change",
    category: "career-stories",
    title: "Changing careers: making your past count",
    description:
      "Switching fields doesn't mean starting from zero. Here's how to carry the experience you already have into something new.",
    author: ORG,
    body: [
      { type: "p", text: "A career change can feel like admitting the last few years don't count. They do. Most of what makes someone good at a job — judgement, reliability, the ability to learn — travels with you. The work is in translating it, not discarding it." },
      { type: "h2", text: "Separate the role from the experience" },
      { type: "p", text: "Your old job title won't fit the new field, but the experience underneath it often does. Look past the title at what you actually did day to day: solved problems, managed people or time, handled pressure, learned systems quickly. That's the part worth carrying over." },
      { type: "h2", text: "Find the transferable evidence" },
      { type: "p", text: "For the field you're moving toward, ask what it really needs — then find moments from your past that show it, even if the setting was different. A teacher moving into training has years of evidence in explaining hard things simply. A hospitality worker moving into operations has evidence in coordinating under pressure." },
      { type: "ul", items: [
        "List what the new field values most",
        "Match each one to something you've genuinely done before",
        "Be honest about the gaps — name them, and how you're closing them",
      ] },
      { type: "h2", text: "Reframe the skill, don't rename the work" },
      { type: "p", text: "Describe your experience in language the new field understands, without pretending it was something it wasn't. \"Coordinated a busy service\" can honestly become \"managed competing priorities in a fast-paced environment\" — same truth, clearer to a new reader." },
      { type: "h2", text: "Tell the story of the change" },
      { type: "p", text: "Employers will wonder why you're switching. Give them a straight answer: what you learned, what you're moving toward, and why your background is an asset rather than a detour. A clear, unapologetic story reassures more than a perfect one." },
      { type: "h2", text: "Your next move" },
      { type: "p", text: "Rebuild your resume around the new direction — lead with the transferable evidence, not the chronology. Then apply for the role you're aiming at, described in its own terms." },
    ],
    related: [
      { label: "Build a resume for your new direction", href: "/resume/builder" },
      { label: "How to discover the skills you already have", href: "/resources/career-stories/discover-skills" },
    ],
  },
  {
    slug: "interview-prep",
    category: "interviews",
    title: "Interview preparation that actually helps",
    description:
      "Preparation calms nerves and sharpens answers. Here's a practical way to get ready without trying to memorise a script.",
    author: ORG,
    body: [
      { type: "p", text: "The goal of interview prep isn't to memorise perfect answers — it's to know your own experience well enough that you can talk about it clearly under a little pressure. Preparation is mostly remembering what you've done and why it matters." },
      { type: "h2", text: "Revisit your own experience first" },
      { type: "p", text: "Before you research the company, research yourself. Go back through your resume and, for each item, remind yourself of the actual story: what the situation was, what you did, and how it turned out. Interviewers ask for examples, and you want them ready." },
      { type: "h2", text: "Prepare evidence, not scripts" },
      { type: "p", text: "For common questions — a challenge you handled, a time you worked in a team, something you're proud of — have a real example in mind rather than a rehearsed paragraph. A simple shape keeps you clear: the situation, what you did, and the result." },
      { type: "ul", items: [
        "Situation — set the scene in a sentence",
        "Action — what you specifically did",
        "Result — what changed because of it",
      ] },
      { type: "h2", text: "Connect your skills to their role" },
      { type: "p", text: "Read the job description closely and note which of your skills it calls for. Then pick the examples that show those skills. You're not changing your story to fit — you're choosing which true parts of it to lead with." },
      { type: "h2", text: "Rehearse out loud, once or twice" },
      { type: "p", text: "Saying an answer aloud is different from thinking it. Practise a few answers to a friend or to yourself — enough to feel natural, not so much that it sounds recited. Prepare two or three genuine questions to ask them, too; interest is part of the impression." },
      { type: "h2", text: "Your next move" },
      { type: "p", text: "Sort out the logistics the day before — where, when, what to bring — so nothing steals your attention. Then trust the preparation. You know your experience better than anyone in the room." },
    ],
    related: [
      { label: "Practise interview questions", href: "/interview/prep" },
      { label: "How to answer “Tell me about yourself”", href: "/resources/interviews/tell-me-about-yourself" },
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
