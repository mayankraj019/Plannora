"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

// Helper: resolves after `ms` milliseconds
const timeout = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Race: auth fetch vs 3-second timeout so the page never stays blank
        const result = await Promise.race([
          supabase.auth.getSession(),
          timeout(3000).then(() => null),
        ]);

        if (result && result.data?.session) {
          setUser(result.data.session.user, result.data.session);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser(session.user, session);
        } else {
          clearUser();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, clearUser]);

  if (loading) {
    return <div className="min-h-screen bg-[#050A18]" />;
  }

  return <>{children}</>;
}
