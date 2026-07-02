"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Mail, Lock, Check, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";
import { toast } from "@/store/toastStore";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();

  // Password Requirement Checks
  const requirements = useMemo(() => {
    return [
      { id: "length", label: "At least 8 characters", valid: password.length >= 8 },
      { id: "uppercase", label: "One uppercase letter (A-Z)", valid: /[A-Z]/.test(password) },
      { id: "lowercase", label: "One lowercase letter (a-z)", valid: /[a-z]/.test(password) },
      { id: "number", label: "One number (0-9)", valid: /[0-9]/.test(password) },
      { id: "special", label: "One special character (!@#$ etc.)", valid: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  // Compute overall score (0 to 5)
  const strengthScore = useMemo(() => {
    return requirements.filter((req) => req.valid).length;
  }, [requirements]);

  const strengthColor = useMemo(() => {
    if (strengthScore <= 2) return "bg-[#FF4D6D]"; // Red
    if (strengthScore <= 4) return "bg-[#FFD166]"; // Yellow/Gold
    return "bg-[#00F5D4]"; // Green/Teal
  }, [strengthScore]);

  const strengthLabel = useMemo(() => {
    if (password.length === 0) return "";
    if (strengthScore <= 2) return "Weak";
    if (strengthScore <= 4) return "Medium";
    return "Strong";
  }, [password, strengthScore]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError(null);

    // Validate email & password strength
    if (strengthScore < 5) {
      toast.error("Please meet all password requirements before continuing.");
      setLoading(false);
      return;
    }

    try {
      // Create user account on Clerk (not yet active)
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      toast.success("Account created! Verification code sent to your email.");
      
      // Redirect directly to the OTP verification screen
      router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to sign up.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
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

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">Create Account</h1>
          <p className="text-sm text-[#E8F0FF]/60 font-body">Start planning your dream itineraries today.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 flex items-center gap-3 text-[#FF4D6D] text-sm">
            <X className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="flex flex-col gap-5">
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
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60 ml-1">Password</label>
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

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="flex flex-col gap-3 mt-1 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#E8F0FF]/60 font-semibold uppercase tracking-wider">Password Strength</span>
                <span className={`font-bold uppercase tracking-wider ${
                  strengthScore <= 2
                    ? "text-[#FF4D6D]"
                    : strengthScore <= 4
                    ? "text-[#FFD166]"
                    : "text-[#00F5D4]"
                }`}>{strengthLabel}</span>
              </div>

              {/* Progress Bar Grid */}
              <div className="grid grid-cols-5 gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i < strengthScore ? strengthColor : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* Specific requirements checklist */}
              <div className="flex flex-col gap-1.5 mt-1">
                {requirements.map((req) => (
                  <div key={req.id} className="flex items-center gap-2.5 text-xs text-[#E8F0FF]/80">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      req.valid 
                        ? "bg-[#00F5D4]/10 border-[#00F5D4]/30 text-[#00F5D4]" 
                        : "bg-white/5 border-white/10 text-[#E8F0FF]/30"
                    }`}>
                      {req.valid ? <Check className="w-2.5 h-2.5" /> : <div className="w-1 h-1 rounded-full bg-[#E8F0FF]/30" />}
                    </div>
                    <span className={req.valid ? "text-[#E8F0FF]/50 line-through" : "text-[#E8F0FF]/80"}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CAPTCHA placeholder for Clerk Bot Sign-up Protection */}
          <div id="clerk-captcha" />

          {/* Sign Up Button (Gradient) */}
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
                Creating Account...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Create Account <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Link to Login */}
        <p className="text-center mt-8 text-sm text-[#E8F0FF]/50 font-body">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#FF8C42] font-semibold hover:text-[#FF8C42]/80 hover:underline transition-colors">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
