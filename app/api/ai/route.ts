import { NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai";
import { safeParseAIRequest, safeParseAIResponse } from "@/lib/ai/schema";

// The ONLY place AI runs. Keys and provider SDKs live here, server-side, and never
// reach the browser. Input is validated on the way in; output is validated on the way
// out. Raw provider errors are never leaked, and resume/profile content is never
// logged.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const req = safeParseAIRequest(body);
  if (!req) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const result = await getAIProvider().complete(req);
    const validated = safeParseAIResponse(result);
    if (!validated) {
      return NextResponse.json(
        { error: "We couldn't generate suggestions just now. Please try again." },
        { status: 502 },
      );
    }
    return NextResponse.json(validated);
  } catch {
    return NextResponse.json(
      { error: "We couldn't generate suggestions just now. Please try again." },
      { status: 502 },
    );
  }
}
