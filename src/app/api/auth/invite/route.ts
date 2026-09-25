import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  INVITES_COLLECTION,
  getInvite,
  inviteStatus,
  isInviteToken,
  logInviteError,
  type InviteStatus,
} from "@/lib/invites";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 20;
const hits = new Map<string, number[]>();

const STATUS_HTTP: Record<Exclude<InviteStatus, "valid">, number> = {
  invalid: 404,
  expired: 410,
  used: 409,
};

const STATUS_MESSAGE: Record<Exclude<InviteStatus, "valid">, string> = {
  invalid: "This invite link is invalid.",
  expired: "This invite link has expired.",
  used: "This invite has already been used.",
};

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

function tokenFromRequest(request: Request, bodyToken?: unknown): { token?: string; error?: "missing" | "invalid" } {
  const queryToken = new URL(request.url).searchParams.get("token");
  for (const raw of [bodyToken, queryToken]) {
    if (typeof raw === "string" && raw.length > 0) {
      return isInviteToken(raw) ? { token: raw } : { error: "invalid" };
    }
  }
  return { error: "missing" };
}

function errorResponse(code: Exclude<InviteStatus, "valid"> | "missing") {
  if (code === "missing") {
    return NextResponse.json(
      { error: "Invite token is required.", code: "missing" },
      { status: 400 }
    );
  }
  return NextResponse.json(
    { error: STATUS_MESSAGE[code], code },
    { status: STATUS_HTTP[code] }
  );
}

async function validateToken(token: string) {
  const invite = await getInvite(token);
  const status = inviteStatus(invite);
  return { invite, status };
}

export async function GET(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many attempts. Try again later.", code: "rate_limited" }, { status: 429 });
  }

  const parsed = tokenFromRequest(request);
  if (!parsed.token) return errorResponse(parsed.error ?? "missing");

  try {
    const { invite, status } = await validateToken(parsed.token);
    if (status !== "valid" || !invite) return errorResponse(status === "valid" ? "invalid" : status);
    return NextResponse.json({ email: invite.email });
  } catch (err) {
    logInviteError("[invite/redeem] GET failed", err);
    return NextResponse.json({ error: "Failed to validate invite.", code: "error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ error: "Too many attempts. Try again later.", code: "rate_limited" }, { status: 429 });
  }

  let body: { token?: unknown; password?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body.", code: "invalid" }, { status: 400 });
  }

  const parsed = tokenFromRequest(request, body.token);
  if (!parsed.token) return errorResponse(parsed.error ?? "missing");

  const password = typeof body.password === "string" ? body.password : "";
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters.", code: "password" },
      { status: 400 }
    );
  }

  try {
    const { invite, status } = await validateToken(parsed.token);
    if (status !== "valid" || !invite) return errorResponse(status === "valid" ? "invalid" : status);

    const auth = await adminAuth();
    const uid = invite.uid || (await auth.getUserByEmail(invite.email)).uid;
    await auth.updateUser(uid, { password, emailVerified: true });

    const db = await adminDb();
    await db.collection(INVITES_COLLECTION).doc(parsed.token).update({
      usedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    logInviteError("[invite/redeem] POST failed", err);
    return NextResponse.json({ error: "Failed to activate invite.", code: "error" }, { status: 500 });
  }
}
