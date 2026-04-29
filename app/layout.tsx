import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import NexoraChat from "@/components/ui/NexoraChat";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
          <NexoraChat />
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
  );
}
