"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const loading = !userLoaded || !authLoaded;

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
    return <div className="min-h-screen bg-[#050A18]" />;
  }

  // Prevent flash of auth page if user is logged in
  if (clerkUser && isAuthRoute) {
    return <div className="min-h-screen bg-[#050A18]" />;
  }

  return <>{children}</>;
}
