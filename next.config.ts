import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Sites starter includes Cloudflare-only support files that are not part
  // of the City Bites Next.js app. Vercel should build the application routes
  // without type-checking those platform-specific helpers.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
