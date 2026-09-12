import type { NextConfig } from "next";

const raw = process.env.NEXT_BASE_PATH ?? "";
const basePath = raw.replace(/\/$/, "") || undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
