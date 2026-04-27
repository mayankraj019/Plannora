"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, MapPin, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Successfully logged in
      router.push("/");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory dark:bg-midnight text-midnight dark:text-ivory flex flex-col items-center justify-center font-body relative overflow-hidden px-6">
      
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-coral/10 rounded-full blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-midnight/60 dark:text-ivory/60 hover:text-amber transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-[#111727] border border-amber/10 shadow-2xl rounded-3xl p-8 lg:p-10 relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-amber/10 flex items-center justify-center shadow-xl overflow-hidden p-2">
              <img src="/logo.png" alt="Plannora Logo" className="w-full h-full object-contain" />
            </div>
          </Link>
        </div>

        <h1 className="text-3xl font-display font-bold text-center mb-2">Welcome Back</h1>
        <p className="text-center text-midnight/60 dark:text-ivory/60 mb-8">Log in to access your saved itineraries.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/20 flex items-center gap-3 text-coral text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ml-1">Email Address</label>
            <Input 
              type="email" 
              placeholder="hello@traveler.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 bg-ivory/30 dark:bg-midnight/30 border-amber/20 focus-visible:border-amber"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 bg-ivory/30 dark:bg-midnight/30 border-amber/20 focus-visible:border-amber"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" className="rounded border-amber/30 text-amber focus:ring-amber bg-transparent" />
              Remember me
            </label>
            <button type="button" className="text-sm text-amber font-semibold hover:underline">Forgot password?</button>
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full mt-4 h-14 shadow-lg shadow-amber/20 text-lg">
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-midnight/60 dark:text-ivory/60">
          Don't have an account? <Link href="/auth/signup" className="text-amber font-semibold hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
