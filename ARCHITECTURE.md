# Architecture — AI Career & Resume Builder

Status: **foundational decisions locked**. This document is authoritative. No feature code should contradict it. Read it before adding a route, a model field, an AI call, or a renderer.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js (App Router)** |
| Language | **TypeScript** (strict mode) |
| Styling | **Tailwind CSS** + a small set of headless primitives (Radix) |
| Forms / validation | **react-hook-form** + **Zod** (shared schema, client + server) |
| Persistence | **SQLite (dev) / Postgres (prod)** via **Prisma** |
| Hosting | **Vercel** |
| Testing | **Vitest** (unit) + **Playwright** (e2e, interview-flow survival) |

**Reasoning (one paragraph).** This is a form-heavy app that generates documents and calls an LLM, so the two hard requirements are (a) server-side code that can hold secrets and run PDF/DOCX generation, and (b) a typed boundary between a rich interactive client and that server. Next.js on the App Router gives both in one deployable unit — Server Components and Route Handlers keep the Anthropic key and rendering off the client, while React + react-hook-form + Zod handle the deep, validated forms of the interview flow with a single schema reused on both sides of the wire. Tailwind keeps the responsive layout maintainable without a parallel CSS system, and Vercel is the zero-config host for Next.js and already the user's deployment target. No new infrastructure is introduced that the team isn't already running.

---

## 2. Data Model — Master Career Profile

### 2.1 Provenance is mandatory on every fact

The core auditability requirement: **every user-facing fact carries where it came from and when it was confirmed.** This is enforced by a single wrapper type. No profile field stores a bare string/array where a fact is expected — it stores a `Fact<T>`.

```ts
type Source = 'user_provided' | 'ai_suggested_confirmed';

interface Fact<T> {
  value: T;
  source: Source;
  confirmedAt: string;              // ISO-8601; when the user accepted this value
  // Present ONLY when source === 'ai_suggested_confirmed'.
  // The verbatim text the AI proposed, retained for audit even after edits.
  originalSuggestion?: string;
}
```

Rules:
- A fact only exists once the user has confirmed it → `confirmedAt` is always set.
- `ai_suggested_confirmed` means the AI proposed it **and** the user accepted it. Raw, unconfirmed AI output never enters the profile — it lives in transient interview state (§2.4) until confirmed.
- `originalSuggestion` is immutable once set. If the user edits an AI value, `value` changes but `originalSuggestion` preserves the AI's words for the audit trail.

### 2.2 Entities

```ts
interface MasterProfile {
  id: string;
  personal: PersonalDetails;
  targetRole: Fact<TargetRole>;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  volunteering: VolunteeringEntry[];
  skills: Fact<string>[];
  tools: Fact<string>[];
  certifications: Fact<Certification>[];
  languages: Fact<LanguageProficiency>[];
  progress: ProgressState;          // §2.3
  createdAt: string;
  updatedAt: string;
}

interface PersonalDetails {
  fullName: Fact<string>;
  email: Fact<string>;
  phone?: Fact<string>;
  location?: Fact<string>;
  links: Fact<{ label: string; url: string }>[];   // LinkedIn, portfolio, GitHub…
}

interface TargetRole {
  title: string;
  seniority?: string;
  industry?: string;
  notes?: string;
}

interface ExperienceEntry {
  id: string;
  company: Fact<string>;
  title: Fact<string>;
  startDate: Fact<string>;
  endDate: Fact<string | null>;     // null === current
  location?: Fact<string>;
  responsibilities: Fact<string>[];
  achievements: Fact<string>[];     // ideally quantified; kept distinct from responsibilities
}

interface EducationEntry {
  id: string;
  institution: Fact<string>;
  credential: Fact<string>;         // degree / diploma
  field?: Fact<string>;
  startDate?: Fact<string>;
  endDate?: Fact<string | null>;
  details: Fact<string>[];          // honors, GPA, coursework
}

interface ProjectEntry {
  id: string;
  name: Fact<string>;
  description: Fact<string>;
  highlights: Fact<string>[];
  link?: Fact<string>;
}

interface VolunteeringEntry {
  id: string;
  organization: Fact<string>;
  role: Fact<string>;
  startDate?: Fact<string>;
  endDate?: Fact<string | null>;
  contributions: Fact<string>[];
}

interface Certification {
  name: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  credentialId?: string;
}

interface LanguageProficiency {
  language: string;
  level: 'basic' | 'conversational' | 'professional' | 'fluent' | 'native';
}
```

### 2.3 Progress / milestone state

The interview is a resumable, multi-step flow. Its state lives in the profile so it survives across devices and sessions (§3).

```ts
type MilestoneId =
  | 'personal'
  | 'target_role'
  | 'experience'
  | 'education'
  | 'projects'
  | 'volunteering'
  | 'skills_tools'
  | 'certifications_languages'
  | 'review';

interface ProgressState {
  currentMilestone: MilestoneId;
  completed: MilestoneId[];
  // Per-milestone status for the progress UI.
  milestones: Record<MilestoneId, {
    status: 'not_started' | 'in_progress' | 'complete';
    lastVisitedAt?: string;
  }>;
  // Percentage is derived, not stored — computed from `completed`.
}
```

### 2.4 Transient interview state (NOT part of the profile)

Unconfirmed AI suggestions and in-progress form drafts are held separately and never written into `MasterProfile` until the user confirms. This is what enforces the §2.1 rule that the profile contains only confirmed facts. Drafts are autosaved (§3) so a refresh doesn't lose a half-answered step, but they are clearly not "facts" until promoted via a confirm action that stamps `source` + `confirmedAt`.

---

## 3. Persistence

**Decision: anonymous session by default, with an optional account for recovery — a recovery link is issued immediately, no sign-up required to start.**

### How it works
- On first visit the server creates a `Profile` row and sets a signed, httpOnly session cookie holding an opaque `profileId` + secret. The interview starts instantly — zero friction.
- The user is shown a **recovery link** (`/resume/<token>`) they can bookmark or email themselves. Hitting it re-binds the session cookie to that profile on any device/browser.
- Optionally, the user can attach an email/password (or magic link) later to "claim" the anonymous profile — same row, now durably recoverable.

### Surviving tab-close and refresh
Two layers:
1. **Server is the source of truth.** Every confirmed fact and every milestone transition is persisted server-side via a typed Route Handler. Closing the tab loses nothing that was confirmed.
2. **Draft autosave.** In-progress (unconfirmed) form input is debounced-autosaved to the server as transient interview state (§2.4) and mirrored to `localStorage` keyed by `profileId`. On reload the client rehydrates from the server; `localStorage` is a fast-path/offline fallback. A refresh mid-step restores both the draft answer and `currentMilestone`.

### Tradeoff chosen and why
| Option | Pro | Con |
|---|---|---|
| Account-required | Simple recovery story | Sign-up wall kills completion on a form-heavy flow; users abandon before value is shown |
| **Anonymous + recovery link + optional account** (chosen) | Zero-friction start; still recoverable; upgradeable to a real account | Slightly more session/token plumbing; recovery link must be treated as a secret |

We optimize for **completion of the interview**, which is the app's core value moment. Forcing an account before the user has seen any output is the most common way to lose them, so we defer identity until after value is delivered, while never leaving them without a way back in.

---

## 4. AI Adapter

**Single interface. Every AI call in the codebase goes through it. No feature imports the Anthropic SDK directly.**

```ts
// lib/ai/provider.ts
export interface AIRequest {
  task: AITaskType;                 // discriminates the prompt/template used server-side
  input: Record<string, unknown>;   // task-specific, validated by Zod per task
  signal?: AbortSignal;
}

export interface AISuggestion {
  text: string;                     // becomes Fact.originalSuggestion on confirm
  meta?: Record<string, unknown>;
}

export interface AIResponse {
  suggestions: AISuggestion[];
  raw?: unknown;                    // provider payload, for logging/debug only
}

export interface AIProvider {
  complete(req: AIRequest): Promise<AIResponse>;
}
```

- **`MockAIProvider`** — deterministic, offline, no network/key. Returns canned suggestions per `task`. This is the default in development and in tests, so the whole app (interview flow, confirm/reject, rendering) is buildable and testable with zero API cost.
- **`AnthropicAIProvider`** — the real implementation, **server-only**. Uses the official Anthropic SDK, model **`claude-opus-5`**, with **adaptive thinking** (`thinking: { type: 'adaptive' }`) and **streaming** for long generations (collected via the SDK's `.finalMessage()` helper). Reads `ANTHROPIC_API_KEY` from server env — never exposed to the client.

Selection is via a single factory (`getAIProvider()`) keyed on env, so swapping mock↔real is one config change and no feature code changes. Features call `getAIProvider().complete(...)` inside Route Handlers only.

---

## 5. Rendering Contract

**One template layer. Both the on-screen preview and the PDF/DOCX export consume it. Two renderers must never exist.**

```ts
// lib/render/contract.ts
// A resume is produced by transforming a MasterProfile (confirmed facts only)
// into a template-agnostic ResumeDocument. Templates render ResumeDocument.
export interface ResumeDocument {
  sections: ResumeSection[];
  theme: ResumeTheme;
}

export interface ResumeTemplate {
  id: string;
  // The single rendering primitive. Given the document, produce a React tree.
  // Screen preview renders it directly; PDF/DOCX export renders the SAME tree
  // through a headless renderer. No template has a separate "export" codepath.
  render(doc: ResumeDocument): ReactNode;
}
```

- `MasterProfile` → `ResumeDocument` is a pure, tested mapping (`toResumeDocument`).
- A `ResumeTemplate.render` is the **only** place resume layout is expressed.
- On-screen preview mounts `render(doc)` in the browser.
- Export mounts the **same** `render(doc)` output through a headless path (details deferred to Prompt 15b) — so preview and export are pixel-consistent by construction.

---

## Cross-cutting requirements (how the setup satisfies the brief)

- **TypeScript** — strict mode, no `any` at boundaries; the `Fact<T>` wrapper and Zod schemas are the type backbone.
- **Reusable components** — headless primitives + a `components/` library shared across interview steps and preview.
- **Form validation** — one Zod schema per milestone, reused client-side (react-hook-form resolver) and server-side (Route Handler guard).
- **Server-side secrets** — `ANTHROPIC_API_KEY` and DB creds only in server env; the AI adapter's real impl is server-only.
- **Typed API boundaries** — Route Handlers validate input with Zod and return typed results; the client calls a thin typed fetch layer.
- **Loading / error states** — every AI call and save has explicit pending/error UI; the adapter surfaces typed errors.
- **Responsive layout** — Tailwind, mobile-first; the interview is single-column on mobile, split preview on desktop.
- **Test setup** — Vitest for the `Fact` invariants, `toResumeDocument` mapping, and `MockAIProvider`; Playwright for the survives-refresh / survives-tab-close guarantee.
