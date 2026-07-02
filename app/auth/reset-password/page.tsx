"use client";

import { useState, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Eye, EyeOff, Lock, AlertCircle, Check, ShieldAlert, KeyRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { toast } from "@/store/toastStore";

function ResetPasswordContent() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get("email") || "" : "";

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

  const strengthScore = useMemo(() => {
    return requirements.filter((req) => req.valid).length;
  }, [requirements]);

  const strengthColor = useMemo(() => {
    if (strengthScore <= 2) return "bg-[#FF4D6D]";
    if (strengthScore <= 4) return "bg-[#FFD166]";
    return "bg-[#00F5D4]";
  }, [strengthScore]);

  const isMatched = useMemo(() => {
    return password !== "" && password === confirmPassword;
  }, [password, confirmPassword]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError(null);

    if (!code) {
      toast.error("Please enter the verification code sent to your email.");
      return;
    }

    if (strengthScore < 5) {
      toast.error("Please meet all password strength requirements.");
      return;
    }

    if (!isMatched) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Attempt verification and update password
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: code,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Password reset successfully! Redirecting...");
        router.push("/");
      } else {
        setError("Password reset is not complete. Status: " + result.status);
        toast.error("Password reset failed.");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to update password. Session may have expired.";
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
          <div className="flex items-center gap-3">
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
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">Reset Password</h1>
          <p className="text-sm text-[#E8F0FF]/60 font-body">
            Please enter the 6-digit code sent to <span className="text-[#FF8C42] font-semibold">{email || "your email"}</span> and your new password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 flex items-center gap-3 text-[#FF4D6D] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
          {/* Verification Code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60 ml-1">Verification Code</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8F0FF]/40" />
              <Input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                className="h-12 pl-11 bg-[#050A18]/50 border-cyan-500/10 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
              />
            </div>
          </div>

          {/* New Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60 ml-1">New Password</label>
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

          {/* Confirm Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#E8F0FF]/60 ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E8F0FF]/40" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-12 pl-11 pr-11 bg-[#050A18]/50 border-cyan-500/10 focus-visible:ring-1 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#E8F0FF]/40 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword !== "" && (
              <div className="flex items-center gap-1.5 mt-1 ml-1 text-xs">
                {isMatched ? (
                  <span className="text-[#00F5D4] flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Passwords match</span>
                ) : (
                  <span className="text-[#FF4D6D] flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Passwords do not match</span>
                )}
              </div>
            )}
          </div>

          {/* Password Strength Checklist */}
          {password.length > 0 && (
            <div className="flex flex-col gap-3 mt-1 bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#E8F0FF]/60 font-semibold uppercase tracking-wider">Strength</span>
                <span className={`font-bold uppercase tracking-wider ${
                  strengthScore <= 2
                    ? "text-[#FF4D6D]"
                    : strengthScore <= 4
                    ? "text-[#FFD166]"
                    : "text-[#00F5D4]"
                }`}>{strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong"}</span>
              </div>

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

          {/* Submit Button (Gradient) */}
          <Button
            type="submit"
            disabled={loading || strengthScore < 5 || !isMatched}
            className="w-full mt-4 h-12 bg-gradient-to-r from-[#FF8C42] to-[#7B2FBE] hover:from-[#FF8C42]/90 hover:to-[#7B2FBE]/90 text-white font-semibold text-base shadow-[0_4px_20px_rgba(255,140,66,0.2)] rounded-xl relative overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving New Password...
              </span>
            ) : (
              "Save & Continue"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050A18] flex items-center justify-center text-[#E8F0FF]/80">Loading reset details...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
