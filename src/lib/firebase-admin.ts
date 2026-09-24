/**
 * Firebase Admin SDK — server-side only.
 * Used in Next.js API routes (never imported in client components).
 *
 * Reads the same FIREBASE_* env vars that scripts/fetch-content.js uses.
 */
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function initAdmin() {
  if (getApps().length) return;

  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "")
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n");

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey,
    }),
  });
}

export function adminAuth() {
  initAdmin();
  return getAuth();
}

/**
 * Verify the Firebase ID token from an Authorization: Bearer <token> header.
 * Returns the decoded token or throws if invalid.
 */
export async function verifyRequest(request: Request) {
  const authHeader = request.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) throw new Error("No token");
  return adminAuth().verifyIdToken(token);
}
