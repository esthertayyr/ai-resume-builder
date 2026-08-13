"use client";

import type { PaperSize, ResumeDocument } from "@/lib/render/contract";
import type { TemplateDefinition } from "@/lib/render/contract";
import { loadDraft } from "@/lib/journey/store";

// Multi-resume persistence for the Resume Builder (save / duplicate / delete).
// Local-first, mirroring the app's existing localStorage approach. The document
// shape is the shared render contract, so preview + DOCX/PDF export all agree.

export type TemplateId = TemplateDefinition["id"];

export type StoredResume = {
  id: string;
  name: string;
  templateId: TemplateId;
  paper: PaperSize;
  doc: ResumeDocument;
  updatedAt: string;
};

const KEY = "tac.resumes.v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function makeId(): string {
  const c = typeof crypto !== "undefined" ? crypto : undefined;
  return c?.randomUUID ? c.randomUUID() : `r_${Math.random().toString(36).slice(2)}`;
}

/** A clean starting document with the standard, reorderable sections. */
export function defaultDoc(): ResumeDocument {
  return {
    contact: { name: "", email: "", phone: "", location: "", links: [] },
    sections: [
      { kind: "summary", heading: "Summary", text: "" },
      { kind: "experience", heading: "Experience", items: [] },
      { kind: "education", heading: "Education", items: [] },
      { kind: "skills", heading: "Skills", items: [] },
    ],
  };
}

/** Seed a resume from whatever the user built in the Career Journey (real data,
 *  not demo content) — their skills and story items carry straight over. */
export function docFromJourney(): ResumeDocument {
  const draft = loadDraft();
  const doc = defaultDoc();
  const skills = doc.sections.find((s) => s.kind === "skills");
  if (skills && skills.kind === "skills") skills.items = [...draft.skills];
  const exp = doc.sections.find((s) => s.kind === "experience");
  if (exp && exp.kind === "experience") {
    exp.items = draft.stories
      .filter((s) => s.title.trim())
      .map((s) => ({ title: s.title, bullets: s.detail.trim() ? [s.detail.trim()] : [] }));
  }
  return doc;
}

/** A starter tuned for students / first-time applicants. Same honest message as
 *  the rest of the platform: less formal work experience ≠ nothing to show. Uses
 *  free-text headings within the shared contract (Leadership, Volunteering, etc.). */
export function internshipDoc(): ResumeDocument {
  const draft = loadDraft();
  const doc: ResumeDocument = {
    contact: { name: "", email: "", phone: "", location: "", links: [] },
    sections: [
      { kind: "summary", heading: "Summary", text: "" },
      { kind: "education", heading: "Education", items: [] },
      { kind: "projects", heading: "Projects", items: [] },
      { kind: "experience", heading: "Leadership & Activities", items: [] },
      { kind: "skills", heading: "Skills", items: [] },
      { kind: "experience", heading: "Volunteer Experience", items: [] },
      { kind: "experience", heading: "Achievements", items: [] },
    ],
  };
  const skills = doc.sections.find((s) => s.kind === "skills");
  if (skills && skills.kind === "skills") skills.items = [...draft.skills];
  return doc;
}

export function loadResumes(): StoredResume[] {
  if (!hasStorage()) return [];
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredResume[];
  } catch {
    return [];
  }
}

export function saveResumes(list: StoredResume[]): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

export type StarterVariant = "blank" | "journey" | "internship";

export function newResume(name = "Untitled resume", starter: StarterVariant = "blank"): StoredResume {
  const doc =
    starter === "journey" ? docFromJourney() : starter === "internship" ? internshipDoc() : defaultDoc();
  return {
    id: makeId(),
    name,
    templateId: "clean",
    paper: "A4",
    doc,
    updatedAt: new Date().toISOString(),
  };
}
