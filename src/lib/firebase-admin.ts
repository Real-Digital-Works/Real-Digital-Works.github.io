import type { Auth } from "firebase-admin/auth";

// ── Singleton cache ─────────────────────────────────────────────────────────
let _auth: Auth | null = null;

// ── Init + auth getter (async — firebase-admin v14 is ESM-only) ─────────────
export async function adminAuth(): Promise<Auth> {
  if (_auth) return _auth;

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  if (!getApps().length) {
    const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
      .replace(/^["']|["']$/g, "")  // strip surrounding quotes
      .replace(/\\n/g, "\n");        // convert escaped newlines

    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey,
      }),
    });
  }

  _auth = getAuth();
  return _auth;
}

// ── Verify the Firebase ID token from an Authorization: Bearer header ────────
export async function verifyRequest(request: Request) {
  const token = (request.headers.get("Authorization") ?? "")
    .replace("Bearer ", "")
    .trim();
  if (!token) throw new Error("No token");
  const auth = await adminAuth();
  return auth.verifyIdToken(token);
}
