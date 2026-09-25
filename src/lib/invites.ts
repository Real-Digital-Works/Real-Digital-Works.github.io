import { randomBytes } from "crypto";
import { adminDb } from "@/lib/firebase-admin";

export const INVITES_COLLECTION = "invites";
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const INVITE_TOKEN_RE = /^[a-f0-9]{64}$/i;

export type InviteRecord = {
  email: string;
  token: string;
  uid?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string | null;
};

export type InviteStatus = "invalid" | "expired" | "used" | "valid";

export function createInviteToken() {
  return randomBytes(32).toString("hex");
}

export function isInviteToken(token: unknown): token is string {
  return typeof token === "string" && INVITE_TOKEN_RE.test(token);
}

export function inviteStatus(data: InviteRecord | undefined): InviteStatus {
  if (!data) return "invalid";
  if (data.usedAt) return "used";
  if (Number.isNaN(Date.parse(data.expiresAt)) || Date.parse(data.expiresAt) <= Date.now()) {
    return "expired";
  }
  return "valid";
}

export async function getInvite(token: string): Promise<InviteRecord | undefined> {
  const db = await adminDb();
  const snap = await db.collection(INVITES_COLLECTION).doc(token).get();
  if (!snap.exists) return undefined;
  return snap.data() as InviteRecord;
}

export function logInviteError(context: string, err: unknown) {
  const raw = err instanceof Error ? err.message : String(err);
  console.error(context, raw.replace(/[a-f0-9]{64}/gi, "[token]"));
}
