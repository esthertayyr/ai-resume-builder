# Career Adventure — AI Resume & Career Builder

A beginner-first web app that helps someone with little or no resume experience
discover the experience and skills they already have, then download a truthful,
ATS-friendly resume as **PDF** or **Word (.docx)**. Experienced users get a faster
path.

**Core principle:** the AI may improve *wording*. The AI may **not** improve
*reality*. Every statement that reaches a resume is traceable to information the
user provided or explicitly confirmed.

---

## Tech stack

| Concern     | Choice                                             |
| ----------- | -------------------------------------------------- |
| Framework   | Next.js 14 (App Router) + React 18                 |
| Language    | TypeScript (strict)                                |
| Styling     | Tailwind CSS                                       |
| Validation  | Zod + react-hook-form                              |
| Export      | `docx` (Word) + browser print-to-PDF               |
| AI          | Provider-agnostic seam (offline **Mock** by default) |
| Persistence | Browser `localStorage` (MVP — no database yet)     |
| Tests       | Vitest                                             |

---

## Local setup

Requires **Node.js >= 18.18** and npm.

```bash
git clone <your-gitlab-repo-url>
cd ai-career-builder
npm install
cp .env.example .env.local   # optional — the app runs with no config
npm run dev                  # http://localhost:3000
```

The app runs fully offline with the **Mock AI** provider, so no API key is needed
to develop or demo the complete flow.

---

## Commands

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the dev server (hot reload)             |
| `npm run build`     | Production build (**also runs type-checking**) |
| `npm start`         | Serve the production build (after `build`)    |
| `npm run lint`      | ESLint (`next/core-web-vitals`)               |
| `npm run typecheck` | `tsc --noEmit` type-check                     |
| `npm test`          | Run the Vitest suite once                     |
| `npm run test:watch`| Vitest in watch mode                          |

**Development command:** `npm run dev`
**Production build command:** `npm run build` → serve with `npm start`

---

## Environment variables

See [`.env.example`](.env.example) for the full, commented template. Copy it to
`.env.local` and fill in real values there. **Never commit** `.env` or `.env.local`.

| Variable            | Scope        | Status      | Notes                                                        |
| ------------------- | ------------ | ----------- | ------------------------------------------------------------ |
| `AI_PROVIDER`       | server       | active seam | `mock` (default). `openrouter` / `anthropic` / `ollama` planned. |
| `ANTHROPIC_API_KEY` | server-only  | planned     | Never prefix `NEXT_PUBLIC_`. Never sent to the browser.      |
| `ANTHROPIC_MODEL`   | server       | planned     | Defaults to `claude-opus-5` when wired.                      |
| `OPENROUTER_API_KEY`| server-only  | planned     | Never expose client-side. Model is configurable.            |
| `OPENROUTER_MODEL`  | server       | planned     | Do not hard-code a specific free model.                     |
| `OLLAMA_BASE_URL`   | server       | planned     | Local model server URL.                                     |

> **Today the app reads no secrets at runtime** — the Mock AI provider is wired in
> and needs none. The variables above become active only when a real, server-side
> provider is implemented behind an `/api/ai` route (see *AI provider setup*).

There is intentionally **no `DATABASE_URL` and no `NEXTAUTH_SECRET`**: the MVP has
no database and no authentication (profiles live in the browser). Add those only
when persistence / accounts are actually built.

---

## AI provider setup

The app talks only to an `AIProvider` interface (`lib/ai/provider.ts`), selected by
a single factory (`lib/ai/index.ts`). No feature code depends on a specific vendor.

- **Mock (default):** offline, deterministic, zero cost, zero secrets. Great for
  development, demos, and CI.
- **Real providers (planned):** Anthropic / OpenRouter / Ollama. When added they
  **must** run server-side (behind an API route) so keys and SDKs never enter a
  client bundle. Set the relevant `*_API_KEY` in `.env.local` (local) or in Vercel
  Environment Variables (deployed), and set `AI_PROVIDER` accordingly.

**Security rule:** real AI calls are server-side only; API keys are never exposed to
the browser and never prefixed with `NEXT_PUBLIC_`.

---

## Database setup

None required. The MVP stores the Master Career Profile in the browser
(`localStorage`) — see `lib/session/store.ts`. There is no server database, no
migrations, and no DB credentials to manage.

A future version may add a database (e.g. Postgres via Prisma) for saved accounts
and multiple resume versions. At that point add `DATABASE_URL` to the environment
and run the relevant migrations; a job-specific resume must never overwrite the
master profile.

---

## Deployment: GitLab → Vercel

### 1. Push to GitLab

Create an **empty** project in GitLab (no README/.gitignore), then from the project
folder:

```bash
git init
git add .
git commit -m "Initial commit: Career Adventure resume builder"
git branch -M main
git remote add origin https://gitlab.com/<your-namespace>/<your-repo>.git
git push -u origin main
```

> `.env`, `.env.local`, `node_modules/`, `.next/`, and generated user files are
> already excluded by [`.gitignore`](.gitignore) — verify with `git status` before
> committing that no secret files are staged.

### 2. Deploy on Vercel

1. In Vercel, **Add New → Project** and import the GitLab repository (authorize the
   GitLab integration if prompted).
2. Vercel auto-detects Next.js. Defaults are correct:
   - **Build command:** `next build`
   - **Output:** `.next` (managed automatically)
   - **Install command:** `npm install`
3. **Environment Variables:** none are required for the mock build. Add server-side
   provider keys (e.g. `ANTHROPIC_API_KEY`) only when a real provider is wired —
   add them for the *Production* (and *Preview*) environments, never as
   `NEXT_PUBLIC_`.
4. **Node version:** set to 18.x or newer in Project Settings (matches
   `engines.node`).
5. Deploy. Every push to `main` → Production; every branch/MR → a Preview
   deployment.

---

## Project structure

```
app/            Routes: landing, /start, /interview, /experienced, /preview
components/     UI components (interview runner, progress rail, CTA)
lib/profile/    Master Career Profile data model + fact provenance + integrity
lib/interview/  Data-driven conversation engine (reducer, hook, scripts)
lib/ai/         Provider-agnostic AI seam + offline Mock provider
lib/render/     Single rendering contract shared by preview and export
lib/export/     PDF (print) + DOCX generation
lib/session/    localStorage persistence
tests/          Vitest suites (source-provenance, render parity)
```

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full design.

---

## Truth & privacy

- Suggestions never auto-become facts; only user-provided or user-confirmed content
  reaches a resume, and source is recorded per fact (`lib/profile/facts.ts`).
- Uploaded files are validated (type + size) before any parsing.
- No resume content or full profile data is logged.
- The user can delete all local data (`deleteAllLocalData` in `lib/session/store.ts`).
