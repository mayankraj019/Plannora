import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.plannora.co.in https://*.clerk.services https://challenges.cloudflare.com https://va.vercel-scripts.com https://cdn.maptiler.com https://*.maptiler.com;
  style-src 'self' 'unsafe-inline' https://api.fontshare.com https://fonts.googleapis.com https://api.maptiler.com https://cdn.maptiler.com https://*.maptiler.com;
  img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://loremflickr.com https://flagcdn.com https://img.clerk.com https://images.clerk.dev https://*.clerk.com https://*.supabase.co https://api.maptiler.com https://cdn.maptiler.com https://*.maptiler.com;
  font-src 'self' data: https://api.fontshare.com https://cdn.fontshare.com https://fonts.gstatic.com https://cdn.maptiler.com https://*.maptiler.com;
  connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.plannora.co.in https://*.clerk.services https://api.clerk.com https://clerk-telemetry.com https://*.clerk-telemetry.com https://*.supabase.co wss://*.supabase.co https://api.maptiler.com https://events.maptiler.com https://cdn.maptiler.com https://*.maptiler.com https://api.unsplash.com https://ipapi.co https://api.bigdatacloud.net https://gist.githubusercontent.com https://generativelanguage.googleapis.com https://*.vercel-insights.com https://vitals.vercel-insights.com;
  frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://clerk.plannora.co.in https://challenges.cloudflare.com;
  worker-src 'self' blob: https://cdn.maptiler.com https://*.maptiler.com;
  child-src 'self' blob: https://cdn.maptiler.com https://*.maptiler.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self' https://clerk.plannora.co.in https://*.clerk.accounts.dev https://*.clerk.com https://www.google.com;
  frame-ancestors 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), serial=(), accelerometer=(), gyroscope=(), magnetometer=(), clipboard-read=(self), clipboard-write=(self), fullscreen=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin-allow-popups",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Embedder-Policy",
    value: "unsafe-none",
  },
];

const nextConfig: NextConfig = {
  // Never bundle MapTiler on the server — it uses browser-only globals (window, navigator, WebGL)
  serverExternalPackages: ["@maptiler/sdk"],
  // Turbopack is the default bundler in Next.js 16
  turbopack: {},
  // Disable X-Powered-By header for security
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

