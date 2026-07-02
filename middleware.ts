import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Match all routes except auth routes, API routes, and static Next.js assets
const isProtectedRoute = createRouteMatcher([
  "/((?!auth|api|_next|favicon.ico|manifest.json|sw.js|icon.png|logo.png|plannora-logo.png|plannora-app-icon-v2.png|globe.svg|file.svg|window.svg|next.svg|vercel.svg).*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.[^?]*$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
