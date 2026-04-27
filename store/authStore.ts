import { create } from "zustand";
import { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  setUser: (user: User | null, session: Session | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  setUser: (user, session) => set({ user, session }),
  clearUser: () => set({ user: null, session: null }),
}));
