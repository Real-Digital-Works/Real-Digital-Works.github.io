import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles the build — no static export needed.
  // images.unoptimized and trailingSlash were GitHub Pages workarounds only.
  images: {
    // Vercel's image optimisation works on the free tier.
    // Remove unoptimized so Next.js can serve properly sized images.
  },
};

export default nextConfig;
