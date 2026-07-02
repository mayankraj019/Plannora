"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#050A18] flex items-center justify-center text-[#E8F0FF]">
      <div className="text-center flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-[#00F5FF]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-semibold tracking-wider font-mono">Authenticating with Google...</span>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
