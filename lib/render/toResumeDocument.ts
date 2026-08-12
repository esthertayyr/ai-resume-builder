import type {
  EducationItem,
  ExperienceItem,
  ResumeDocument,
  ResumeSection,
} from "./contract";
import type { Fact, MasterProfile } from "@/lib/profile/types";

// Pure mapping: confirmed profile facts -> ResumeDocument. Only fact VALUES are read
// (provenance is preserved on the profile). Empty sections are omitted — prefer
// omission over padding (AI rules).

const val = <T,>(f?: Fact<T>): T | undefined => f?.value;

function dateRange(start?: Fact<string>, end?: Fact<string | null>): string | undefined {
  const s = val(start);
  const e = end ? (end.value === null ? "Present" : end.value) : undefined;
  if (s && e) return `${s} – ${e}`;
  return s || (e && e !== "Present" ? e : undefined);
}

export function toResumeDocument(p: MasterProfile): ResumeDocument {
  const sections: ResumeSection[] = [];

  // Summary
  const summary = val(p.summary);
  if (summary && summary.trim()) {
    sections.push({ kind: "summary", heading: "Summary", text: summary });
  }

  // Experience
  const experience: ExperienceItem[] = p.experience.map((e) => ({
    title: val(e.title) ?? "",
    organization: val(e.company) || undefined, // omit unknown/empty employers

    location: val(e.location),
    dateRange: dateRange(e.startDate, e.endDate),
    bullets: [...e.responsibilities, ...e.achievements].map((f) => f.value),
  }));
  if (experience.length) sections.push({ kind: "experience", heading: "Experience", items: experience });

  // Projects / activities
  const projects: ExperienceItem[] = p.projects.map((pr) => ({
    title: val(pr.name) ?? "",
    organization: undefined,
    dateRange: undefined,
    bullets: [
      ...(val(pr.description) ? [val(pr.description) as string] : []),
      ...pr.highlights.map((f) => f.value),
    ],
  }));
  if (projects.length) sections.push({ kind: "projects", heading: "Projects & Activities", items: projects });

  // Education
  const education: EducationItem[] = p.education.map((ed) => ({
    credential: val(ed.credential) ?? "",
    institution: val(ed.institution),
    dateRange: dateRange(ed.startDate, ed.endDate),
    bullets: ed.details.map((f) => f.value),
  }));
  if (education.length) sections.push({ kind: "education", heading: "Education", items: education });

  // Skills
  const skills = p.skills.map((f) => f.value).filter((s) => s.trim().length > 0);
  if (skills.length) sections.push({ kind: "skills", heading: "Skills", items: skills });

  return {
    contact: {
      name: val(p.personal.fullName),
      email: val(p.personal.email),
      phone: val(p.personal.phone),
      location: val(p.personal.location),
      links: p.personal.links.map((l) => l.value),
    },
    sections,
  };
}
