"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";
import { toast } from "@/store/toastStore";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams ? searchParams.get("email") || "" : "";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { isLoaded, signUp, setActive } = useSignUp();

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle typing inside the OTP fields
  const handleChange = (value: string, index: number) => {
    // Only allow numeric input
    if (value !== "" && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only the last entered digit
    setOtp(newOtp);

    // Auto-focus next input if value is entered
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (otp[index] !== "") {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Clear previous input and focus it
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle pasting complete 6-digit OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Please paste digits only.");
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      if (pastedData[i]) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    // Focus the correct input after paste
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // Submit OTP for Verification
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    const token = otp.join("");

    if (token.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Attempt verification on Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: token,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        toast.success("Email verified successfully! Welcome to Plannora.", "Success");
        router.push("/");
      } else {
        setError("Verification is not complete. Status: " + completeSignUp.status);
        toast.error("Verification is incomplete.");
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Invalid or expired verification code.";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Code
  const handleResend = async () => {
    if (!isLoaded) return;
    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("Verification code resent! Check your email.");
      setTimer(60); // Reset timer
      setOtp(["", "", "", "", "", ""]); // Reset inputs
      inputRefs.current[0]?.focus(); // Refocus first field
    } catch (err: any) {
      const errMsg = err.errors?.[0]?.longMessage || err.message || "Failed to resend code.";
      toast.error(errMsg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050A18] text-[#E8F0FF] flex flex-col items-center justify-center font-body relative overflow-hidden px-4 md:px-6">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-[#FF8C42]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] bg-[#7B2FBE]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="grid-bg absolute inset-0 z-0 pointer-events-none opacity-20" />

      <Link href="/auth/signup" className="absolute top-8 left-8 flex items-center gap-2 text-[#E8F0FF]/60 hover:text-white transition-colors text-sm font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Signup
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md plannora-glass border border-cyan-500/10 shadow-2xl rounded-3xl p-6 md:p-8 lg:p-10 relative z-10"
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

        {/* Headings */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-semibold text-white tracking-tight mb-2">Verify Your Email</h1>
          <p className="text-sm text-[#E8F0FF]/60 font-body">
            We've sent a 6-digit verification code to <span className="text-[#FF8C42] font-semibold">{email || "your email"}</span>.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 flex items-center gap-3 text-[#FF4D6D] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          {/* 6-Digit OTP Inputs */}
          <div className="flex justify-between gap-2.5">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center font-display font-semibold text-xl bg-[#050A18]/50 border border-cyan-500/10 focus:border-[#FF8C42] focus:ring-1 focus:ring-[#FF8C42] rounded-xl outline-none transition-all"
              />
            ))}
          </div>

          {/* Submit Button (Gradient) */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-12 bg-gradient-to-r from-[#FF8C42] to-[#7B2FBE] hover:from-[#FF8C42]/90 hover:to-[#7B2FBE]/90 text-white font-semibold text-base shadow-[0_4px_20px_rgba(255,140,66,0.2)] rounded-xl relative overflow-hidden transition-all duration-300"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Verify & Continue
              </span>
            )}
          </Button>
        </form>

        {/* Resend Action */}
        <div className="flex flex-col items-center justify-center mt-8 gap-3">
          <p className="text-sm text-[#E8F0FF]/50 font-body">Didn't receive the code?</p>
          <button
            type="button"
            disabled={timer > 0 || resending}
            onClick={handleResend}
            className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
              timer > 0
                ? "text-[#E8F0FF]/30 cursor-not-allowed"
                : "text-[#00F5FF] hover:text-[#00F5FF]/80 hover:underline"
            }`}
          >
            {resending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Resending Code...
              </>
            ) : timer > 0 ? (
              `Resend Code in ${timer}s`
            ) : (
              <>
                <RefreshCw className="w-4 h-4" /> Resend Code
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050A18] flex items-center justify-center text-[#E8F0FF]/80">Loading verification details...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
