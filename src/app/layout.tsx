import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { ErrorReporter } from "@/components/ErrorReporter";
import { uiScript } from "@/lib/local/ui";
// Arabic UI font bundled with the app (no Google Fonts request) — works offline.
import "@fontsource/ibm-plex-sans-arabic/arabic-400.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-500.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-600.css";
import "@fontsource/ibm-plex-sans-arabic/arabic-700.css";
import "@fontsource/ibm-plex-sans-arabic/latin-400.css";
import "@fontsource/ibm-plex-sans-arabic/latin-500.css";
import "@fontsource/ibm-plex-sans-arabic/latin-600.css";
import "@fontsource/ibm-plex-sans-arabic/latin-700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "سبير — إدارة المدارس",
  description: "منصة عربية لإدارة المدارس الحكومية والأهلية: الكادر والجداول والصفوف والنتائج والشهادات والإجازات والخطط السنوية والأقساط.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#1d4ed8" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Build id for the stations' offline copy (public/local-sw.js). */}
        <meta name="lab-build" content={process.env.LAB_BUILD} />
        <script dangerouslySetInnerHTML={{ __html: uiScript }} />
        {/* No-flash theme: apply the saved (or system) theme before paint. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('lab-theme');if(t==='dark'||(!t&&window.matchMedia&&matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <Toaster position="top-center" richColors />
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}
