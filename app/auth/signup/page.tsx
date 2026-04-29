"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      // Depending on Supabase settings, they might need to confirm email
      if (data.user && data.user.identities && data.user.identities.length === 0) {
          setError("Account already exists. Try logging in.");
      } else if (data.session) {
          router.push("/"); // Auto-login worked (email confirmation disabled)
      } else {
          setSuccess(true); // Needs email confirmation
      }
    } catch (err: any  ) {
      console.error(err);
      setError(err.message || "Failed to sign up.");
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber to-coral flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>

        <h1 className="text-3xl font-display font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-midnight/60 dark:text-ivory/60 mb-8">Start planning your dream trips today.</p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-coral/10 border border-coral/20 flex items-center gap-3 text-coral text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success ? (
          <div className="text-center p-6 bg-amber/10 border border-amber/20 rounded-xl">
            <h3 className="text-amber font-bold mb-2">Check your email!</h3>
            <p className="text-sm text-midnight/80 dark:text-ivory/80">
              We sent a confirmation link to {email}. Please verify your email to log in.
            </p>
            <Link href="/auth/login">
              <Button className="mt-6 w-full">Go to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-5">
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
                minLength={6}
                className="h-14 bg-ivory/30 dark:bg-midnight/30 border-amber/20 focus-visible:border-amber"
              />
              <p className="text-xs text-midnight/40 dark:text-ivory/40 ml-1">Must be at least 6 characters.</p>
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full mt-4 h-14 shadow-lg shadow-amber/20 text-lg">
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
        )}

        <p className="text-center mt-8 text-sm text-midnight/60 dark:text-ivory/60">
          Already have an account? <Link href="/auth/login" className="text-amber font-semibold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}
