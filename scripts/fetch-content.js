#!/usr/bin/env node
/**
 * scripts/fetch-content.js
 *
 * Reads content from Firestore and writes src/data/content.json.
 * Run this before `npm run build` so the static site bakes in the latest copy.
 *
 * Usage:
 *   node scripts/fetch-content.js
 *
 * Required environment variables (set in GitHub Actions secrets / Vercel):
 *   FIREBASE_PROJECT_ID      — your Firebase project ID
 *   FIREBASE_CLIENT_EMAIL    — service account email
 *   FIREBASE_PRIVATE_KEY     — service account private key (with \n escaped as \\n)
 *
 * If the env vars are missing, the script exits without touching content.json
 * so a local dev build still works with the committed seed data.
 */

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const OUTPUT = path.join(__dirname, "../src/data/content.json");

// ── Check credentials ────────────────────────────────────────────────────────

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.log(
    "[fetch-content] Firebase admin credentials not set — skipping Firestore fetch. Using committed content.json."
  );
  process.exit(0);
}

// ── Init Firebase Admin ──────────────────────────────────────────────────────

if (!getApps().length) {
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

// ── Fetch and write ──────────────────────────────────────────────────────────

async function main() {
  console.log("[fetch-content] Fetching from Firestore…");

  const snap = await db.doc("cms/content").get();

  if (!snap.exists) {
    console.log(
      "[fetch-content] cms/content document not found in Firestore — keeping committed content.json."
    );
    process.exit(0);
  }

  const firestoreData = snap.data();

  // Load the current seed file to use as defaults for any missing fields
  const existing = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));

  // Deep-merge: Firestore values win, seed fills any gaps
  const merged = {
    ...existing,
    ...firestoreData,
    version: (existing.version ?? 1),
    lastUpdated: new Date().toISOString(),
  };

  fs.writeFileSync(OUTPUT, JSON.stringify(merged, null, 2) + "\n", "utf-8");
  console.log(`[fetch-content] ✓ Wrote ${OUTPUT}`);
}

main().catch((err) => {
  console.error("[fetch-content] Error:", err);
  process.exit(1);
});
