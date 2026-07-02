import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import NoraChat from "@/components/ui/NoraChat";
import { ToastContainer } from "@/components/ui/Toast";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Plannora - AI Travel Planner",
  description: "Plan your perfect trip in seconds with AI.",
  manifest: "/manifest.json",
  icons: {
    icon: "/plannora-app-icon-v2.png",
    apple: "/plannora-app-icon-v2.png",
  },
};

export const viewport = {
  themeColor: "#FF7F50",
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en" className="h-full antialiased dark">
        <head>
          <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
        </head>
        <body className="antialiased min-h-screen bg-[#050A18] text-[#E8F0FF] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-md bg-white/5 border border-[#FF4D6D]/20 p-8 rounded-3xl backdrop-blur-md">
            <h2 className="text-xl font-semibold text-[#FF4D6D] mb-4">Clerk API Keys Missing</h2>
            <p className="text-sm text-[#E8F0FF]/60 mb-6 leading-relaxed">
              Your deployment is missing the Clerk Publishable Key. Please add your environment variables to Vercel.
            </p>
            <div className="text-xs text-[#E8F0FF]/40 bg-[#050A18] p-4 rounded-xl border border-white/5 font-mono text-left space-y-2">
              <p className="font-semibold text-white">Required Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to Vercel Settings → Environment Variables</li>
                <li>Add <code className="text-[#00F5FF] font-semibold">NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code></li>
                <li>Add <code className="text-[#00F5FF] font-semibold">CLERK_SECRET_KEY</code></li>
                <li>Redeploy the project on Vercel</li>
              </ol>
            </div>
            <button 
              onClick={() => typeof window !== "undefined" && window.location.reload()}
              className="mt-6 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-all"
            >
              Check Again
            </button>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="h-full antialiased dark">
        <head>
          <link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Plannora" />
        </head>
        <body className="antialiased min-h-screen selection:bg-amber/30 selection:text-amber">
          <AuthProvider>
            <CustomCursor />
            <NoraChat />
            <ToastContainer />
            {children}
          </AuthProvider>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
