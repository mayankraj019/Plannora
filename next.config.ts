import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Never bundle MapTiler on the server — it uses browser-only globals (window, navigator, WebGL)
  serverExternalPackages: ["@maptiler/sdk"],
  // Turbopack is the default bundler in Next.js 16
  turbopack: {},
};

export default nextConfig;
