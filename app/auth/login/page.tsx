"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { toast } from "@/store/toastStore";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back to Plannora!");
        router.push("/");
      } else {
        // Handle other login states if they arise (e.g. MFA)
        setError("Sign in is not complete. Status: " + result.status);
        toast.error("Please complete all steps to sign in.");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to log in.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to start Google authentication.";
      toast.error(errMsg);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050A18] text-[#E8F0FF] flex flex-col items-center justify-center font-body relative overflow-y-auto py-10 px-4 md:px-6">
      {/* Ambient background */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#FF8C42]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#7B2FBE]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="grid-bg absolute inset-0 z-0 pointer-events-none opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md plannora-glass border border-cyan-500/10 shadow-2xl rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 relative z-10"
      >
        {/* Brand Logo & Name */}
        <div className="flex justify-center mb-6">
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-cyan-500/20 p-1.5 shadow-xl">
                  <img src="/plannora-logo.png" alt="Plannora Logo" className="w-full h-full object-contain" />
                </div>
                <div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    boxShadow: "0 0 12px rgba(0,245,255,0.3)",
                    animation: "pulseRing 2s ease-out infinite",
                  }}
                />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight text-white">
                Plan<span style={{ color: "#00F5FF" }} className="neon-text">nora</span>
              </span>
            </motion.div>
          </Link>
        </div>

        {/* Headings */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">Welcome Back</h1>
          <p className="text-sm text-[#E8F0FF]/60 font-body">Your ultimate AI-powered travel itinerary companion.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 flex items-center gap-3 text-[#FF4D6D] text-sm font-medium"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8F0FF]/40" />
              <Input
                type="email"
                placeholder="hello@traveler.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 pl-11 bg-[#050A18]/50 border-cyan-500/10 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60">Password</label>
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-[#FF8C42] hover:text-[#FF8C42]/80 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8F0FF]/40" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 pl-11 pr-11 bg-[#050A18]/50 border-cyan-500/10 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E8F0FF]/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 mt-1">
            <label className="flex items-center gap-2.5 text-sm text-[#E8F0FF]/60 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-cyan-500/20 text-[#FF8C42] focus:ring-transparent bg-[#050A18]/50"
              />
              Remember me
            </label>
          </div>

          {/* Submit Button (Gradient) */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-12 bg-gradient-to-r from-[#FF8C42] to-[#7B2FBE] hover:from-[#FF8C42]/90 hover:to-[#7B2FBE]/90 text-white font-semibold text-base shadow-[0_4px_20px_rgba(255,140,66,0.2)] rounded-xl relative overflow-hidden transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Logging In...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Log In <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-cyan-500/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0f19] px-3 text-[#E8F0FF]/40 font-mono">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full h-12 rounded-xl border border-cyan-500/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/20 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-sm"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.65 1.4 7.56l3.85 2.99c.9-2.7 3.42-4.51 6.75-4.51z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.91c2.2-2.02 3.67-5 3.67-8.64z"
            />
            <path
              fill="#FBBC05"
              d="M5.25 14.75c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.4 7.18C.51 8.96 0 10.93 0 13s.51 4.04 1.4 5.82l3.85-3.07z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.91c-1.1.74-2.52 1.18-4.2 1.18-3.33 0-5.85-1.81-6.75-4.51l-3.85 2.99C3.37 20.35 7.35 23 12 23z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Link to Signup */}
        <p className="text-center mt-8 text-sm text-[#E8F0FF]/50 font-body">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-[#FF8C42] font-semibold hover:text-[#FF8C42]/80 hover:underline transition-colors">
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
