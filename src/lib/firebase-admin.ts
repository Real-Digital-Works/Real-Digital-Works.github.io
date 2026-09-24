import type { Auth } from "firebase-admin/auth";

// ── Singleton cache ─────────────────────────────────────────────────────────
let _auth: Auth | null = null;

// ── Init + auth getter (async — firebase-admin v14 is ESM-only) ─────────────
export async function adminAuth(): Promise<Auth> {
  if (_auth) return _auth;

  const { getApps, initializeApp, cert } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? "";

    if (!projectId || !clientEmail || !rawKey) {
      console.error("[firebase-admin] Missing env vars:", {
        FIREBASE_PROJECT_ID: !!projectId,
        FIREBASE_CLIENT_EMAIL: !!clientEmail,
        FIREBASE_PRIVATE_KEY: !!rawKey,
      });
      throw new Error("Firebase Admin env vars not set");
    }

    const privateKey = rawKey
      .replace(/^["']|["']$/g, "")  // strip surrounding quotes
      .replace(/\\n/g, "\n");        // convert escaped newlines

    console.log("[firebase-admin] Initialising with project:", projectId);

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  _auth = getAuth();
  return _auth;
}

// ── Verify the Firebase ID token from an Authorization: Bearer header ────────
export async function verifyRequest(request: Request) {
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    console.error("[firebase-admin] verifyRequest: no token in Authorization header");
    throw new Error("No token");
  }

  try {
    const auth = await adminAuth();
    return await auth.verifyIdToken(token);
  } catch (err) {
    console.error("[firebase-admin] verifyIdToken failed:", err);
    throw err;
  }
}
