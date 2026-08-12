// Master Career Profile — the single source of truth.
// Every user-facing fact carries provenance so any resume statement is traceable to
// (A) user-provided info, or (B) an AI suggestion the user explicitly confirmed.
// See ARCHITECTURE.md §2.

export type Source = "user_provided" | "ai_suggested_confirmed";

/**
 * Wrapper enforcing provenance on every fact. A bare string/array must never be
 * stored where a fact is expected — use userFact()/aiConfirmedFact() in facts.ts.
 */
export interface Fact<T> {
  value: T;
  source: Source;
  /** ISO-8601. When the user accepted this value. Always present. */
  confirmedAt: string;
  /**
   * The verbatim text the AI proposed. Present ONLY when
   * source === "ai_suggested_confirmed". Immutable once set (audit trail),
   * even if the user later edits `value`.
   */
  originalSuggestion?: string;
  /** Set to true when a manual edit changed an AI value (Prompt 14 traceability). */
  editedByUser?: boolean;
}

export interface Link {
  label: string;
  url: string;
}

export interface PersonalDetails {
  fullName?: Fact<string>;
  email?: Fact<string>;
  phone?: Fact<string>;
  location?: Fact<string>;
  links: Fact<Link>[];
}

export interface TargetRole {
  title: string;
  seniority?: string;
  industry?: string;
  notes?: string;
}

export interface ExperienceEntry {
  id: string;
  company: Fact<string>;
  title: Fact<string>;
  startDate?: Fact<string>;
  endDate?: Fact<string | null>; // null === current
  location?: Fact<string>;
  responsibilities: Fact<string>[];
  achievements: Fact<string>[];
}

export interface EducationEntry {
  id: string;
  institution: Fact<string>;
  credential: Fact<string>;
  field?: Fact<string>;
  startDate?: Fact<string>;
  endDate?: Fact<string | null>;
  details: Fact<string>[];
}

/** Projects & activities — school/uni projects, volunteering, clubs, freelance, etc. */
export interface ProjectEntry {
  id: string;
  name: Fact<string>;
  kind?: "project" | "volunteering" | "club" | "competition" | "tutoring" | "freelance" | "other";
  description?: Fact<string>;
  highlights: Fact<string>[];
  link?: Fact<string>;
}

export interface Certification {
  name: string;
  issuer?: string;
  issuedAt?: string;
  expiresAt?: string;
  credentialId?: string;
}

export interface LanguageProficiency {
  language: string;
  level: "basic" | "conversational" | "professional" | "fluent" | "native";
}

// ---- Progress / milestones (Prompts 0, 9) ----

export type MilestoneId =
  | "basic_profile"
  | "experience_discovered"
  | "skills_confirmed"
  | "career_story"
  | "resume_ready";

export interface MilestoneState {
  status: "not_started" | "in_progress" | "complete";
  lastVisitedAt?: string;
}

export interface ProgressState {
  milestones: Record<MilestoneId, MilestoneState>;
  /** Which guidance path the user chose (Prompt 3). Changeable later. */
  path?: ExperiencePath;
}

export type ExperiencePath = "just_starting" | "some_experience" | "experienced";

// ---- Root ----

export interface MasterProfile {
  id: string;
  personal: PersonalDetails;
  targetRole?: Fact<TargetRole>;
  /** Professional summary (Prompt 13). AI-generated but user-confirmed. */
  summary?: Fact<string>;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects: ProjectEntry[];
  skills: Fact<string>[];
  tools: Fact<string>[];
  certifications: Fact<Certification>[];
  languages: Fact<LanguageProficiency>[];
  progress: ProgressState;
  createdAt: string;
  updatedAt: string;
}

/** Any `Fact<unknown>` — used by the source-integrity walker (Prompt 12). */
export type AnyFact = Fact<unknown>;
