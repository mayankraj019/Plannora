"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Mail, AlertCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { toast } from "@/store/toastStore";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, signIn } = useSignIn();
  const router = useRouter();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send a password reset code via Clerk
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      toast.success("Verification code sent! Check your inbox.");
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to send reset code. Please try again.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050A18] text-[#E8F0FF] flex flex-col items-center justify-center font-body relative overflow-y-auto py-10 px-4 md:px-6">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#FF8C42]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#7B2FBE]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="grid-bg absolute inset-0 z-0 pointer-events-none opacity-20" />

      <Link href="/auth/login" className="absolute top-8 left-8 flex items-center gap-2 text-[#E8F0FF]/60 hover:text-white transition-colors text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Login
      </Link>

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
          <h1 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">Forgot Password</h1>
          <p className="text-sm text-[#E8F0FF]/60 font-body">
            Enter your email address and we'll send you a 6-digit code to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 flex items-center gap-3 text-[#FF4D6D] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleResetRequest} className="flex flex-col gap-5">
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

          {/* Submit Button (Gradient) */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-12 bg-gradient-to-r from-[#FF8C42] to-[#7B2FBE] hover:from-[#FF8C42]/90 hover:to-[#7B2FBE]/90 text-white font-semibold text-base shadow-[0_4px_20px_rgba(255,140,66,0.2)] rounded-xl relative overflow-hidden transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending Code...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Send Verification Code
              </span>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
