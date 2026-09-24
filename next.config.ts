import type { NextConfig } from "next";

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
};

export default nextConfig;
