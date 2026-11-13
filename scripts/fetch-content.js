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

// Normalise the private key:
//  • Strip surrounding quotes if the value was pasted with them
//  • Replace literal \n sequences with real newlines
const rawKey = process.env.FIREBASE_PRIVATE_KEY ?? "";
const privateKey = rawKey
  .replace(/^["']|["']$/g, "")   // remove surrounding quotes
  .replace(/\\n/g, "\n");         // convert escaped newlines to real ones

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

function toIso(value) {
  if (value == null) return value;
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000).toISOString();
  if (typeof value._seconds === "number") return new Date(value._seconds * 1000).toISOString();
  return value;
}

function serializeDoc(data) {
  const out = {};
  for (const [key, value] of Object.entries(data ?? {})) {
    out[key] = toIso(value);
  }
  return out;
}

function publishedAtMs(value) {
  const iso = toIso(value);
  if (typeof iso !== "string" || !iso) return 0;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? 0 : ms;
}

// ── Fetch and write ──────────────────────────────────────────────────────────

async function main() {
  console.log("[fetch-content] Fetching from Firestore…");

  // Load the current seed file to use as defaults for any missing fields
  const existing = JSON.parse(fs.readFileSync(OUTPUT, "utf-8"));

  // ── Main CMS content doc ────────────────────────────────────────────────
  const snap = await db.doc("cms/content").get();
  let firestoreData = {};

  if (!snap.exists) {
    console.log(
      "[fetch-content] cms/content document not found — keeping seed fields, still fetching blogs/pages."
    );
  } else {
    firestoreData = snap.data() ?? {};
  }

  // Collection blogs win over any `blogs` array on cms/content so a Save of
  // the visual-editor doc cannot wipe published posts from the public site.
  // Fetch without orderBy so posts missing publishedAt are not dropped.
  const blogsSnap = await db.collection("blogs").get();
  const blogs = blogsSnap.docs
    .map((docSnap) => serializeDoc({ slug: docSnap.id, ...docSnap.data() }))
    .sort((a, b) => publishedAtMs(b.publishedAt) - publishedAtMs(a.publishedAt));
  console.log(`[fetch-content] Found ${blogs.length} blog post(s)`);

  const pagesSnap = await db.collection("pages").get();
  const pages = pagesSnap.docs.map((docSnap) =>
    serializeDoc({ slug: docSnap.id, ...docSnap.data() }),
  );
  console.log(`[fetch-content] Found ${pages.length} custom page(s)`);

  // Deep-merge: Firestore values win, seed fills any gaps.
  // Arrays such as `projects` would otherwise replace the git list entirely
  // (live Work stayed on Plot Atelier and dropped new client sites).
  const liveProjects = Array.isArray(firestoreData.projects)
    ? firestoreData.projects
    : existing.projects;
  const liveSlugs = new Set(
    (Array.isArray(liveProjects) ? liveProjects : [])
      .map((item) => item && item.slug)
      .filter(Boolean),
  );
  const extraProjects = (Array.isArray(existing.projects) ? existing.projects : []).filter(
    (item) => item && item.slug && !liveSlugs.has(item.slug),
  );

  const merged = {
    ...existing,
    ...firestoreData,
    projects: [...extraProjects, ...(Array.isArray(liveProjects) ? liveProjects : [])],
    blogs,
    pages,
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
