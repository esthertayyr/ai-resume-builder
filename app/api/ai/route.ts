import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAIProvider } from "@/lib/ai";
import { AI_LIMITS, AIUnavailableError } from "@/lib/ai/provider";
import { safeParseAIRequest, inputCharLength } from "@/lib/ai/schema";
import { rateLimit, logUsage } from "@/lib/ai/usage";

// The ONLY place AI runs. Keys and provider SDKs live here, server-side, and never
// reach the browser. Input is validated + size-capped on the way in; output is
// validated on the way out. Raw provider errors are never leaked, and resume/profile
// content is never logged.
export const runtime = "nodejs";

const UNAVAILABLE = "AI assistance is temporarily unavailable. Your resume is safe — you can continue editing manually.";
const FRIENDLY = {
  badRequest: "Invalid request.",
  tooLong: "That's a lot of text — please shorten it and try again.",
  rate_limited: UNAVAILABLE,
  unavailable: UNAVAILABLE,
} as const;

// A stable-per-browser session id via an httpOnly cookie. Not auth — just a key for
// per-session rate limiting so one browser can't fire unlimited requests.
function sessionKey(request: Request): { key: string; setCookie?: string } {
  const cookie = request.headers.get("cookie") ?? "";
  const found = /(?:^|;\s*)tac_sid=([A-Za-z0-9-]+)/.exec(cookie);
  if (found) return { key: found[1] };
  const id = randomUUID();
  return {
    key: id,
    setCookie: `tac_sid=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
  };
}

export async function POST(request: Request) {
  const started = Date.now();
  const { key, setCookie } = sessionKey(request);
  const withCookie = (res: NextResponse) => {
    if (setCookie) res.headers.set("Set-Cookie", setCookie);
    return res;
  };

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return withCookie(NextResponse.json({ error: FRIENDLY.badRequest }, { status: 400 }));
  }

  const req = safeParseAIRequest(body);
  if (!req) {
    return withCookie(NextResponse.json({ error: FRIENDLY.badRequest }, { status: 400 }));
  }

  // Input-size cap BEFORE touching the provider (protects the paid/limited model).
  if (inputCharLength(req.input) > AI_LIMITS.maxInputChars) {
    return withCookie(NextResponse.json({ error: FRIENDLY.tooLong }, { status: 413 }));
  }

  // Per-session rate limit.
  const rl = rateLimit(key, started);
  const provider = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  const model = process.env.OPENROUTER_MODEL ?? provider;
  if (!rl.ok) {
    logUsage({ task: req.task, provider, model, ok: false, rateLimited: true, ms: 0, status: 429 });
    const res = NextResponse.json({ error: FRIENDLY.rate_limited }, { status: 429 });
    res.headers.set("Retry-After", String(rl.retryAfter));
    return withCookie(res);
  }

  try {
    const result = await getAIProvider().complete(req);
    // Providers already return the validated shape, but re-validate defensively so a
    // real model can never inject an unexpected structure into the app.
    if (!result || !Array.isArray(result.suggestions)) {
      throw new AIUnavailableError("unavailable");
    }
    logUsage({ task: req.task, provider, model, ok: true, ms: Date.now() - started, status: 200 });
    return withCookie(NextResponse.json(result));
  } catch (err) {
    const kind = err instanceof AIUnavailableError ? err.kind : "unavailable";
    const status = kind === "rate_limited" ? 429 : 502;
    logUsage({ task: req.task, provider, model, ok: false, rateLimited: kind === "rate_limited", ms: Date.now() - started, status });
    return withCookie(NextResponse.json({ error: FRIENDLY[kind] }, { status }));
  }
}
