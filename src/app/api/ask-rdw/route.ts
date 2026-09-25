import { NextResponse } from "next/server";
import {
  REFUSAL,
  completeAskRdw,
  isOffTopic,
  parseAskBody,
} from "@/lib/ask-rdw";

export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;
const hits = new Map<string, number[]>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 10_000) hits.clear();
  return recent.length > MAX_HITS;
}

export async function POST(request: Request) {
  try {
    if (rateLimited(clientIp(request))) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later.", fallback: true, code: "rate_limited" },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body.", fallback: true }, { status: 400 });
    }

    const parsed = parseAskBody(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error, fallback: true }, { status: 400 });
    }

    if (isOffTopic(parsed.message)) {
      return NextResponse.json({ reply: REFUSAL });
    }

    const result = await completeAskRdw(parsed.history, parsed.message);
    if ("fallback" in result) {
      return NextResponse.json({ fallback: true });
    }

    return NextResponse.json({ reply: result.reply });
  } catch {
    return NextResponse.json({ fallback: true });
  }
}
