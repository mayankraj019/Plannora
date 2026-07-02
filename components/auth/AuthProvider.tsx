"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  
  const [timeoutReached, setTimeoutReached] = useState(false);

  const loading = !userLoaded || !authLoaded;

  // Track initialization timeout for debugging misconfigured keys or domain issues
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);

  // Sync Clerk user session with global Zustand authStore
  useEffect(() => {
    if (userLoaded && authLoaded) {
      if (clerkUser) {
        setUser(
          {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            email_confirmed_at: new Date().toISOString(),
          } as any,
          {} as any
        );
      } else {
        clearUser();
      }
    }
  }, [clerkUser, userLoaded, authLoaded, setUser, clearUser]);

  // Client-side redirection for authenticated users visiting auth routes
  useEffect(() => {
    if (!loading) {
      const isAuthRoute = pathname ? pathname.startsWith("/auth") : false;
      if (clerkUser && isAuthRoute) {
        router.push("/");
      }
    }
  }, [clerkUser, loading, pathname, router]);

  const isAuthRoute = pathname ? pathname.startsWith("/auth") : false;

  if (loading) {
    if (timeoutReached) {
      return (
        <div className="min-h-screen bg-[#050A18] text-[#E8F0FF] flex flex-col items-center justify-center p-6 text-center font-body">
          <div className="w-full max-w-md bg-white/5 border border-[#FF4D6D]/20 p-8 rounded-3xl backdrop-blur-md">
            <h2 className="text-xl font-display font-semibold text-[#FF4D6D] mb-4">Clerk Failed to Load</h2>
            <p className="text-sm text-[#E8F0FF]/60 mb-6 leading-relaxed">
              This usually happens if your Clerk Publishable Key is missing in Vercel, or if you are using <strong>Development Keys (pk_test_...)</strong> on a custom production domain (<strong>plannora.co.in</strong>).
            </p>
            <p className="text-xs text-[#E8F0FF]/40 bg-[#050A18] p-4 rounded-xl border border-white/5 font-mono break-all text-left">
              Hostname: {typeof window !== "undefined" ? window.location.hostname : "unknown"}<br />
              Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? "Configured (Starts with " + process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.substring(0, 10) + "...)" : "Not Configured"}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Retry Connection
            </button>
          </div>
        </div>
      );
    }
    return <div className="min-h-screen bg-[#050A18]" />;
  }

  // Prevent flash of auth page if user is logged in
  if (clerkUser && isAuthRoute) {
    return <div className="min-h-screen bg-[#050A18]" />;
  }

  return <>{children}</>;
}
