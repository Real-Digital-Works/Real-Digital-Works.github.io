import { adminDb } from "@/lib/firebase-admin";

export type DeployHookSource = "firestore" | "env" | "none";

const SETTINGS_DOC = "cms/settings";
const VERCEL_DEPLOY_HOST = "api.vercel.com";
const VERCEL_DEPLOY_PATH = "/v1/integrations/deploy/";

export function envDeployHook(): string {
  return (process.env.DEPLOY_HOOK_URL ?? process.env.VERCEL_DEPLOY_HOOK ?? "").trim();
}

export function maskDeployHook(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/");
    const last = segments[segments.length - 1] ?? "";
    if (last) {
      segments[segments.length - 1] =
        last.length <= 8 ? "••••••••" : `${last.slice(0, 4)}••••${last.slice(-4)}`;
    }
    parsed.pathname = segments.join("/");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return "••••••••";
  }
}

export function looksMasked(url: string): boolean {
  return url.includes("••••");
}

export function isValidDeployHookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === VERCEL_DEPLOY_HOST &&
      parsed.pathname.startsWith(VERCEL_DEPLOY_PATH) &&
      !looksMasked(url)
    );
  } catch {
    return false;
  }
}

export async function firestoreDeployHook(): Promise<string> {
  const db = await adminDb();
  const snap = await db.doc(SETTINGS_DOC).get();
  const value = snap.exists ? snap.data()?.deployHook : undefined;
  return typeof value === "string" ? value.trim() : "";
}

export async function saveFirestoreDeployHook(url: string): Promise<void> {
  const db = await adminDb();
  const { FieldValue } = await import("firebase-admin/firestore");
  await db.doc(SETTINGS_DOC).set(
    {
      deployHook: url,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
}

export async function resolveDeployHook(preloadedOverride?: string): Promise<{
  url: string;
  source: DeployHookSource;
}> {
  const fromStore = preloadedOverride !== undefined ? preloadedOverride : await firestoreDeployHook();
  if (fromStore && isValidDeployHookUrl(fromStore)) {
    return { url: fromStore, source: "firestore" };
  }

  const fromEnv = envDeployHook();
  if (fromEnv && isValidDeployHookUrl(fromEnv)) {
    return { url: fromEnv, source: "env" };
  }

  return { url: "", source: "none" };
}

export async function triggerVercelDeploy(url: string): Promise<void> {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`Deploy hook failed (${res.status})`);
  }
}
