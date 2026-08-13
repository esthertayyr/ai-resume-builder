"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ds";
import { RenderedResume } from "@/lib/render/RenderedResume";
import { TEMPLATES } from "@/lib/render/templates";
import type {
  CertificationItem,
  EducationItem,
  ExperienceItem,
  PaperSize,
  ResumeDocument,
  ResumeSection,
} from "@/lib/render/contract";
import { DownloadPanel } from "@/components/resume/DownloadPanel";
import {
  loadResumes,
  makeId,
  newResume,
  saveResumes,
  type StoredResume,
  type TemplateId,
} from "@/lib/resume/store";
import {
  LookCloserAction,
  ImproveBulletAction,
  DiscoverSkillsAction,
  WriteSummaryAction,
  ReviewResumeAction,
  JobMatchAction,
} from "@/components/resume/ai/actions";

// Editorial document editor: form/editor left, live preview right (desktop);
// editor + a Preview tab on mobile. Reuses the shared render layer, so the
// preview is byte-for-byte what DOCX/PDF export produce. All three templates are
// single-column and ATS-safe.

// Six ATS-safe templates. Each id maps to a real TemplateDefinition in
// lib/render/templates.ts (distinct typographic tokens) — switching only changes
// how the same content is typeset; it never edits resume data or calls the AI.
const TEMPLATE_CHOICES: { id: TemplateId; label: string; note?: string }[] = [
  { id: "clean", label: "Clean ATS", note: "Neutral and safe for any applicant tracking system" },
  { id: "minimal", label: "Minimal", note: "No rules, tight spacing — all focus on the words" },
  { id: "modern", label: "Modern", note: "Contemporary, roomy, restrained indigo accent" },
  { id: "editorial", label: "Editorial", note: "The Annotated Career voice — serif with signature red" },
  { id: "executive", label: "Executive", note: "Centered refined serif for senior roles" },
  { id: "creative", label: "Creative", note: "Centered and airy with a cool teal accent" },
];

type Tab = "edit" | "preview";

// `variant` controls only the starter used when the user has no saved resumes:
// the standard builder seeds from the Career Journey; the internship builder seeds
// a student-friendly section layout. Saved resumes are shared across both.
export function ResumeBuilder({ variant = "standard" }: { variant?: "standard" | "internship" }) {
  const [list, setList] = useState<StoredResume[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [tab, setTab] = useState<Tab>("edit");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate; create a first resume with the right starter if none exist.
  useEffect(() => {
    const existing = loadResumes();
    if (existing.length) {
      setList(existing);
      setActiveId(existing[0].id);
    } else {
      const first =
        variant === "internship"
          ? newResume("My internship resume", "internship")
          : newResume("My resume", "journey");
      setList([first]);
      setActiveId(first.id);
    }
    setHydrated(true);
  }, [variant]);

  useEffect(() => {
    if (hydrated) saveResumes(list);
  }, [list, hydrated]);

  const active = useMemo(() => list.find((r) => r.id === activeId), [list, activeId]);

  function patchActive(patch: Partial<StoredResume>) {
    setList((l) =>
      l.map((r) => (r.id === activeId ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r)),
    );
  }
  function patchDoc(next: ResumeDocument) {
    patchActive({ doc: next });
  }

  function addResume() {
    const r = newResume(`Resume ${list.length + 1}`);
    setList((l) => [r, ...l]);
    setActiveId(r.id);
  }
  function duplicateActive() {
    if (!active) return;
    const copy: StoredResume = { ...active, id: makeId(), name: `${active.name} (copy)`, doc: structuredCloneSafe(active.doc), updatedAt: new Date().toISOString() };
    setList((l) => [copy, ...l]);
    setActiveId(copy.id);
  }
  function deleteActive() {
    if (!active) return;
    const remaining = list.filter((r) => r.id !== active.id);
    setList(remaining.length ? remaining : [newResume("My resume")]);
    setActiveId(remaining[0]?.id ?? "");
  }

  if (!active) {
    return (
      <div className="mx-auto max-w-content px-5 py-16 md:px-8">
        <p className="text-muted">Loading your resumes…</p>
      </div>
    );
  }

  const template = TEMPLATES[active.templateId];

  return (
    <div className="mx-auto max-w-content px-5 py-8 md:px-8">
      {/* Toolbar */}
      <div className="no-print flex flex-col gap-4 border-b border-hair pb-5">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="resume-select" className="sr-only">
            Choose a resume
          </label>
          <select
            id="resume-select"
            value={active.id}
            onChange={(e) => setActiveId(e.target.value)}
            className="rounded-lg border border-hair bg-surface px-3 py-2 text-sm text-ink"
          >
            {list.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <Button variant="secondary" size="md" onClick={addResume}>
            + New
          </Button>
          <Button variant="secondary" size="md" onClick={duplicateActive}>
            Duplicate
          </Button>
          <Button variant="ghost" size="md" onClick={deleteActive}>
            Delete
          </Button>
          <span className="label-mono ml-auto text-muted">Saved locally · auto-saves</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="resume-name" className="sr-only">
            Resume name
          </label>
          <input
            id="resume-name"
            value={active.name}
            onChange={(e) => patchActive({ name: e.target.value })}
            className="min-w-40 flex-1 rounded-lg border border-hair bg-surface px-3 py-2 text-sm text-ink"
          />
          {/* Templates */}
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CHOICES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => patchActive({ templateId: t.id })}
                aria-pressed={active.templateId === t.id}
                title={t.note}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  active.templateId === t.id
                    ? "border-red bg-red text-paper"
                    : "border-hair bg-surface text-ink hover:border-red"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <label htmlFor="paper" className="sr-only">
            Paper size
          </label>
          <select
            id="paper"
            value={active.paper}
            onChange={(e) => patchActive({ paper: e.target.value as PaperSize })}
            className="rounded-lg border border-hair bg-surface px-3 py-2 text-sm text-ink"
          >
            <option value="A4">A4</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mobile tab switch */}
          <div className="ml-auto flex rounded-lg border border-hair p-1 lg:hidden">
            {(["edit", "preview"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={`rounded-md px-3 py-1.5 text-sm capitalize ${
                  tab === t ? "bg-ink text-paper" : "text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The close: download panel (byte-for-byte the preview, template-aware). */}
      <div className="mt-6">
        <DownloadPanel doc={active.doc} template={template} paper={active.paper} />
      </div>

      {/* Editor + preview */}
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div className={`no-print ${tab === "preview" ? "hidden lg:block" : ""}`}>
          <Editor doc={active.doc} onChange={patchDoc} />
        </div>
        <div className={tab === "edit" ? "hidden lg:block" : ""}>
          <div className="lg:sticky lg:top-20">
            <p className="label-mono mb-2 text-muted no-print">Live preview</p>
            <div className="preview-scale overflow-auto rounded-card border border-hair bg-warmgray p-4">
              <div style={{ zoom: 0.7 }}>
                <RenderedResume doc={active.doc} template={template} paper={active.paper} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------- Editor --------------------------

function Editor({ doc, onChange }: { doc: ResumeDocument; onChange: (d: ResumeDocument) => void }) {
  const setContact = (patch: Partial<ResumeDocument["contact"]>) =>
    onChange({ ...doc, contact: { ...doc.contact, ...patch } });

  const setSection = (i: number, next: ResumeSection) =>
    onChange({ ...doc, sections: doc.sections.map((s, idx) => (idx === i ? next : s)) });

  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= doc.sections.length) return;
    const copy = [...doc.sections];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange({ ...doc, sections: copy });
  };

  const removeSection = (i: number) =>
    onChange({ ...doc, sections: doc.sections.filter((_, idx) => idx !== i) });

  const addSection = (section: ResumeSection) => onChange({ ...doc, sections: [...doc.sections, section] });

  // Explicit-accept sink for AI suggestions: appends unique skills to the Skills
  // section (creating it if absent). Never overwrites; case-insensitive de-dup.
  const addSkills = (names: string[]) => {
    const clean = names.map((n) => n.trim()).filter(Boolean);
    if (!clean.length) return;
    const sections = [...doc.sections];
    let idx = sections.findIndex((s) => s.kind === "skills");
    if (idx === -1) {
      sections.push({ kind: "skills", heading: "Skills", items: [] });
      idx = sections.length - 1;
    }
    const sec = sections[idx];
    if (sec.kind !== "skills") return;
    const seen = new Set(sec.items.map((x) => x.toLowerCase()));
    const merged = [...sec.items];
    for (const n of clean) {
      if (!seen.has(n.toLowerCase())) {
        merged.push(n);
        seen.add(n.toLowerCase());
      }
    }
    sections[idx] = { ...sec, items: merged };
    onChange({ ...doc, sections });
  };

  const presentKinds = new Set(doc.sections.map((s) => s.kind));

  return (
    <div className="space-y-6">
      {/* Contact */}
      <fieldset className="rounded-card border border-hair bg-surface p-5">
        <legend className="px-1 font-display text-lg font-semibold text-ink">Personal information</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={doc.contact.name ?? ""} onChange={(v) => setContact({ name: v })} />
          <Field label="Email" value={doc.contact.email ?? ""} onChange={(v) => setContact({ email: v })} />
          <Field label="Phone" value={doc.contact.phone ?? ""} onChange={(v) => setContact({ phone: v })} />
          <Field label="Location" value={doc.contact.location ?? ""} onChange={(v) => setContact({ location: v })} />
        </div>
      </fieldset>

      {doc.sections.map((section, i) => (
        <div key={`${section.kind}-${i}`} className="rounded-card border border-hair bg-surface p-5">
          <div className="flex items-center gap-2">
            <input
              value={section.heading}
              onChange={(e) => setSection(i, { ...section, heading: e.target.value })}
              aria-label="Section heading"
              className="flex-1 border-b border-hair bg-transparent pb-1 font-display text-lg font-semibold text-ink outline-none focus:border-red"
            />
            <SectionControls
              onUp={() => moveSection(i, -1)}
              onDown={() => moveSection(i, 1)}
              onRemove={() => removeSection(i)}
            />
          </div>

          <div className="mt-4">
            {section.kind === "summary" && (
              <>
                <textarea
                  value={section.text}
                  onChange={(e) => setSection(i, { ...section, text: e.target.value })}
                  rows={4}
                  placeholder="A short, honest summary of who you are and what you're looking for."
                  className="w-full rounded-lg border border-hair bg-paper p-3 text-sm text-ink outline-none focus:border-red"
                />
                <WriteSummaryAction doc={doc} onUse={(text) => setSection(i, { ...section, text })} />
              </>
            )}

            {(section.kind === "experience" || section.kind === "projects") && (
              <ExperienceEditor
                items={section.items}
                onChange={(items) => setSection(i, { ...section, items })}
                onAddSkills={addSkills}
              />
            )}

            {section.kind === "education" && (
              <EducationEditor
                items={section.items}
                onChange={(items) => setSection(i, { ...section, items })}
              />
            )}

            {section.kind === "skills" && (
              <>
                <ChipEditor items={section.items} onChange={(items) => setSection(i, { ...section, items })} />
                <DiscoverSkillsAction doc={doc} onAddSkills={addSkills} />
              </>
            )}

            {section.kind === "certifications" && (
              <CertificationsEditor
                items={section.items}
                onChange={(items) => setSection(i, { ...section, items })}
                onAddSkills={addSkills}
              />
            )}
          </div>
        </div>
      ))}

      {/* Add section */}
      <div className="rounded-card border border-dashed border-hair p-4">
        <p className="label-mono text-muted">Add a section</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!presentKinds.has("summary") && (
            <AddBtn onClick={() => addSection({ kind: "summary", heading: "Summary", text: "" })}>Summary</AddBtn>
          )}
          <AddBtn onClick={() => addSection({ kind: "experience", heading: "Experience", items: [] })}>
            Experience
          </AddBtn>
          <AddBtn onClick={() => addSection({ kind: "projects", heading: "Projects", items: [] })}>Projects</AddBtn>
          <AddBtn onClick={() => addSection({ kind: "experience", heading: "Volunteer Experience", items: [] })}>
            Volunteer
          </AddBtn>
          <AddBtn onClick={() => addSection({ kind: "education", heading: "Education", items: [] })}>Education</AddBtn>
          {!presentKinds.has("skills") && (
            <AddBtn onClick={() => addSection({ kind: "skills", heading: "Skills", items: [] })}>Skills</AddBtn>
          )}
          {!presentKinds.has("certifications") && (
            <AddBtn onClick={() => addSection({ kind: "certifications", heading: "Certifications & Licenses", items: [] })}>
              Certifications
            </AddBtn>
          )}
        </div>
      </div>

      {/* Resume-level editor's read — never edits your resume, only reads it. */}
      <div className="rounded-card border border-hair bg-surface p-5">
        <p className="font-display text-lg font-semibold text-ink">Look closer at the whole thing</p>
        <p className="mt-1 text-sm text-muted">
          Two more sets of editor's eyes — a read of the whole resume, and a side-by-side with a job you're eyeing.
          Neither one changes a word without you.
        </p>
        <div className="mt-4 space-y-5">
          <ReviewResumeAction doc={doc} />
          <div className="border-t border-hair pt-5">
            <JobMatchAction doc={doc} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ExperienceEditor({
  items,
  onChange,
  onAddSkills,
}: {
  items: ExperienceItem[];
  onChange: (items: ExperienceItem[]) => void;
  onAddSkills: (names: string[]) => void;
}) {
  const set = (idx: number, patch: Partial<ExperienceItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const move = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[idx], copy[j]] = [copy[j], copy[idx]];
    onChange(copy);
  };
  return (
    <div className="space-y-4">
      {items.map((it, idx) => (
        <div key={idx} className="rounded-lg border border-hair bg-paper p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Title" value={it.title} onChange={(v) => set(idx, { title: v })} />
            <Field label="Organization" value={it.organization ?? ""} onChange={(v) => set(idx, { organization: v })} />
            <Field label="Dates" value={it.dateRange ?? ""} onChange={(v) => set(idx, { dateRange: v })} />
            <Field label="Location" value={it.location ?? ""} onChange={(v) => set(idx, { location: v })} />
          </div>
          <BulletEditor bullets={it.bullets} onChange={(bullets) => set(idx, { bullets })} />
          <LookCloserAction item={it} onAddSkills={onAddSkills} />
          <div className="mt-2 flex justify-end gap-2 text-sm">
            <button type="button" className="text-muted hover:text-ink" onClick={() => move(idx, -1)}>
              ↑
            </button>
            <button type="button" className="text-muted hover:text-ink" onClick={() => move(idx, 1)}>
              ↓
            </button>
            <button
              type="button"
              className="text-muted hover:text-red"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onChange([...items, { title: "", bullets: [] }])}>+ Add entry</AddBtn>
    </div>
  );
}

function EducationEditor({
  items,
  onChange,
}: {
  items: EducationItem[];
  onChange: (items: EducationItem[]) => void;
}) {
  const set = (idx: number, patch: Partial<EducationItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-4">
      {items.map((it, idx) => (
        <div key={idx} className="rounded-lg border border-hair bg-paper p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="Credential" value={it.credential} onChange={(v) => set(idx, { credential: v })} />
            <Field label="Institution" value={it.institution ?? ""} onChange={(v) => set(idx, { institution: v })} />
            <Field label="Dates" value={it.dateRange ?? ""} onChange={(v) => set(idx, { dateRange: v })} />
          </div>
          <BulletEditor bullets={it.bullets} onChange={(bullets) => set(idx, { bullets })} />
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-sm text-muted hover:text-red"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onChange([...items, { credential: "", bullets: [] }])}>+ Add entry</AddBtn>
    </div>
  );
}

function CertificationsEditor({
  items,
  onChange,
  onAddSkills,
}: {
  items: CertificationItem[];
  onChange: (items: CertificationItem[]) => void;
  onAddSkills: (names: string[]) => void;
}) {
  const set = (idx: number, patch: Partial<CertificationItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  return (
    <div className="space-y-4">
      {items.map((it, idx) => {
        // ISO "YYYY-MM" sorts chronologically, so a plain string compare validates order.
        const dateError = !it.doesNotExpire && !!it.issueDate && !!it.expiryDate && it.expiryDate < it.issueDate;
        return (
          <div key={idx} className="rounded-lg border border-hair bg-paper p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Name" value={it.name} onChange={(v) => set(idx, { name: v })} />
              <Field
                label="Issuing organization"
                value={it.issuingOrganization ?? ""}
                onChange={(v) => set(idx, { issuingOrganization: v })}
              />
              <Field
                label="Credential ID (optional)"
                value={it.credentialNumber ?? ""}
                onChange={(v) => set(idx, { credentialNumber: v })}
              />
              <Field
                label="Verification URL (optional)"
                value={it.verificationUrl ?? ""}
                onChange={(v) => set(idx, { verificationUrl: v })}
              />
              <MonthField label="Issued" value={it.issueDate ?? ""} onChange={(v) => set(idx, { issueDate: v })} />
              <MonthField
                label="Expires"
                value={it.expiryDate ?? ""}
                disabled={it.doesNotExpire}
                onChange={(v) => set(idx, { expiryDate: v })}
              />
            </div>
            <label className="mt-2 flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={!!it.doesNotExpire}
                onChange={(e) => set(idx, { doesNotExpire: e.target.checked, ...(e.target.checked ? { expiryDate: "" } : {}) })}
              />
              This credential does not expire
            </label>
            {dateError && (
              <p className="mt-1 text-sm text-red" role="alert">
                Expiry date can’t be before the issue date.
              </p>
            )}
            <div className="mt-2">
              <label className="label-mono block text-muted">Description (optional)</label>
              <textarea
                value={it.description ?? ""}
                onChange={(e) => set(idx, { description: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-lg border border-hair bg-surface p-2 text-sm text-ink outline-none focus:border-red"
              />
            </div>
            <div className="mt-2">
              <label className="label-mono block text-muted">Related skills (comma-separated, optional)</label>
              <div className="mt-1 flex gap-2">
                <input
                  value={(it.relatedSkills ?? []).join(", ")}
                  onChange={(e) =>
                    set(idx, {
                      relatedSkills: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  className="flex-1 rounded-lg border border-hair bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-red"
                />
                {(it.relatedSkills?.length ?? 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => onAddSkills(it.relatedSkills ?? [])}
                    className="whitespace-nowrap rounded-lg border border-red px-3 text-sm text-red transition hover:bg-red hover:text-paper"
                  >
                    Add to Skills
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                className="text-sm text-muted hover:text-red"
                onClick={() => onChange(items.filter((_, i) => i !== idx))}
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
      <AddBtn onClick={() => onChange([...items, { name: "" }])}>+ Add certification</AddBtn>
    </div>
  );
}

function MonthField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useMemo(() => `m-${label.replace(/\s+/g, "-").toLowerCase()}-${makeId().slice(0, 4)}`, [label]);
  return (
    <div>
      <label htmlFor={id} className="label-mono block text-muted">
        {label}
      </label>
      <input
        id={id}
        type="month"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-red disabled:opacity-50"
      />
    </div>
  );
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="mt-2 space-y-2">
      {bullets.map((b, i) => (
        <div key={i}>
          <div className="flex items-center gap-2">
            <span className="text-red" aria-hidden>
              •
            </span>
            <input
              value={b}
              aria-label={`Bullet ${i + 1}`}
              onChange={(e) => onChange(bullets.map((x, idx) => (idx === i ? e.target.value : x)))}
              className="flex-1 rounded border border-hair bg-surface px-2 py-1 text-sm text-ink outline-none focus:border-red"
            />
            <button type="button" className="text-muted hover:text-red" onClick={() => onChange(bullets.filter((_, idx) => idx !== i))}>
              ×
            </button>
          </div>
          <div className="ml-5 mt-1">
            <ImproveBulletAction
              value={b}
              onUse={(text) => onChange(bullets.map((x, idx) => (idx === i ? text : x)))}
            />
          </div>
        </div>
      ))}
      <AddBtn onClick={() => onChange([...bullets, ""])}>+ Add bullet</AddBtn>
    </div>
  );
}

function ChipEditor({ items, onChange }: { items: string[]; onChange: (i: string[]) => void }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <ul className="flex flex-wrap gap-2">
        {items.map((s) => (
          <li key={s} className="flex items-center gap-2 rounded-pill border border-hair bg-paper px-3 py-1.5 text-sm text-ink">
            {s}
            <button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(items.filter((x) => x !== s))} className="text-muted hover:text-red">
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (v && !items.includes(v)) onChange([...items, v]);
          setValue("");
        }}
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Add a skill"
          placeholder="Add a skill…"
          className="w-40 rounded-pill border border-hair bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-red"
        />
        <AddBtn onClick={() => undefined} type="submit">
          Add
        </AddBtn>
      </form>
    </div>
  );
}

// -------------------------- small UI --------------------------

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useMemo(() => `f-${label.replace(/\s+/g, "-").toLowerCase()}-${makeId().slice(0, 4)}`, [label]);
  return (
    <div>
      <label htmlFor={id} className="label-mono block text-muted">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-hair bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-red"
      />
    </div>
  );
}

function SectionControls({ onUp, onDown, onRemove }: { onUp: () => void; onDown: () => void; onRemove: () => void }) {
  const btn = "flex h-9 w-9 items-center justify-center rounded text-muted hover:text-ink";
  return (
    <div className="flex items-center gap-1 text-sm">
      <button type="button" aria-label="Move section up" className={btn} onClick={onUp}>
        ↑
      </button>
      <button type="button" aria-label="Move section down" className={btn} onClick={onDown}>
        ↓
      </button>
      <button type="button" aria-label="Remove section" className={`${btn} hover:text-red`} onClick={onRemove}>
        ✕
      </button>
    </div>
  );
}

function AddBtn({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-lg border border-hair bg-surface px-3 py-1.5 text-sm text-ink transition hover:border-red hover:text-red"
    >
      {children}
    </button>
  );
}

function structuredCloneSafe<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
