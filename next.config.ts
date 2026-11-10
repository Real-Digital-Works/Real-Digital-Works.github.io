import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Conservative first-pass CSP: allow existing inline theme/JSON-LD scripts,
// Google Fonts, Firebase Auth/Firestore, Vercel Analytics, and Turnstile.
// Tighten later (nonces) once this is confirmed not to blank the live site.
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src",
    "'self'",
    "'unsafe-inline'",
    isDev ? "'unsafe-eval'" : "",
    "https://challenges.cloudflare.com",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
  ]
    .filter(Boolean)
    .join(" "),
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com https://fonts.googleapis.com",
  [
    "connect-src",
    "'self'",
    "https://*.googleapis.com",
    "https://*.gstatic.com",
    "https://*.firebaseio.com",
    "https://*.firebaseapp.com",
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    "https://firestore.googleapis.com",
    "https://firebasestorage.googleapis.com",
    "https://*.firebasestorage.app",
    "https://*.storage.googleapis.com",
    "wss://*.googleapis.com",
    "wss://*.firebaseio.com",
    "https://va.vercel-scripts.com",
    "https://vitals.vercel-insights.com",
    "https://challenges.cloudflare.com",
  ].join(" "),
  "frame-src 'self' https://challenges.cloudflare.com",
  "child-src 'self' https://challenges.cloudflare.com",
  "worker-src 'self' blob: https://challenges.cloudflare.com",
  "media-src 'self' blob: data: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Vercel handles the build — no static export needed.
  // images.unoptimized and trailingSlash were GitHub Pages workarounds only.
  images: {
    // Vercel's image optimisation works on the free tier.
    // Remove unoptimized so Next.js can serve properly sized images.
  },

  // firebase-admin uses native Node.js modules (crypto, http2, etc.)
  // that must NOT be bundled by webpack — mark them as server-side externals.
  serverExternalPackages: ["firebase-admin", "nodemailer"],

  async headers() {
    return [
      { source: "/", headers: securityHeaders },
      { source: "/:path*", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
