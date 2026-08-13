// ============================================================================
// Site configuration — single source of truth for navigation, tool availability,
// support link and social handles. No fake URLs: links that don't exist yet are
// marked `available: false` (rendered as "coming soon") or left as null so the UI
// can show a placeholder instead of a dead link.
// ============================================================================

export type NavItem = { label: string; href: string };

/** Primary desktop navigation. */
export const NAV: NavItem[] = [
  { label: "Build", href: "/start" },
  { label: "Discover", href: "/resources" },
  { label: "Learn", href: "/resources" },
  { label: "About", href: "/about" },
];

export const PRIMARY_CTA = { label: "Build Your Next Move", href: "/start" };

/** A tool the platform offers. `available` gates whether it's a real link. */
export type Tool = {
  id: string;
  name: string;
  description: string;
  href: string;
  available: boolean;
};

export const TOOLS: Tool[] = [
  {
    id: "resume-builder",
    name: "Resume Builder",
    description: "Turn what you've done into a clear, professional resume.",
    href: "/resume/builder",
    available: true,
  },
  {
    id: "ats-checker",
    name: "ATS Resume Checker",
    description: "See common readability and relevance issues before you apply.",
    href: "/resume/ats",
    available: true,
  },
  {
    id: "cover-letter",
    name: "Cover Letter Builder",
    description: "Draft a focused cover letter for a specific role.",
    href: "/cover-letter",
    available: true,
  },
  {
    id: "interview-prep",
    name: "Interview Preparation",
    description: "Practise the questions employers actually ask.",
    href: "/interview/prep",
    available: true,
  },
  {
    id: "job-application",
    name: "Job Application Guidance",
    description: "Application emails, follow-ups and thank-you notes.",
    href: "/job-search",
    available: false,
  },
  {
    id: "remote-va",
    name: "Remote / VA Career Guidance",
    description: "Find remote work and a virtual-assistant niche that fits you.",
    href: "/remote-work",
    available: false,
  },
  {
    id: "internship-resume",
    name: "Internship Resume Builder",
    description: "Build a strong first resume from school, projects and activities.",
    href: "/internship",
    available: true,
  },
];

/**
 * Support / donation link — the project's real PayPal.Me page. This is a genuine
 * destination (not a fake payment form); the UI links out to it in a new tab.
 * Override at build time with NEXT_PUBLIC_SUPPORT_URL if needed.
 */
export const SUPPORT_URL: string | null =
  process.env.NEXT_PUBLIC_SUPPORT_URL && process.env.NEXT_PUBLIC_SUPPORT_URL.length > 0
    ? process.env.NEXT_PUBLIC_SUPPORT_URL
    : "https://paypal.me/Emikaeltyr";

/** Social handles. `url: null` = account not created yet → rendered as a
 *  non-linked placeholder (no fake social URLs). */
export const SOCIALS: { label: string; url: string | null }[] = [
  { label: "Instagram", url: null },
  { label: "TikTok", url: null },
  { label: "Facebook", url: null },
];

/** Footer link columns. Hrefs point at planned stable URLs (topic clusters). */
export const FOOTER_COLUMNS: { title: string; links: NavItem[] }[] = [
  {
    title: "Build",
    links: [
      { label: "Resume Builder", href: "/resume/builder" },
      { label: "ATS Checker", href: "/resume/ats" },
      { label: "Cover Letter", href: "/cover-letter" },
      { label: "Interview Prep", href: "/interview/prep" },
    ],
  },
  {
    title: "Discover",
    links: [
      { label: "Career Stories", href: "/resources/career-stories" },
      { label: "Resume Guides", href: "/resources/resumes" },
      { label: "Internship Guides", href: "/resources/internships" },
      { label: "All Resources", href: "/resources" },
    ],
  },
  {
    title: "Learn",
    links: [
      { label: "ATS Guides", href: "/resources/ats" },
      { label: "Interview Tips", href: "/interview/prep" },
      { label: "Job Search", href: "/resources/job-search" },
      { label: "Remote & VA", href: "/resources/remote-work" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our Mission", href: "/about" },
      { label: "About", href: "/about" },
      { label: "Support", href: "/support" },
      { label: "Buy Me a Coffee", href: "/support" },
    ],
  },
];
