import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { ToastViewport } from "@/components/toast-viewport";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("edurate_theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", savedTheme === "dark" || (!savedTheme && prefersDark));
    } catch {}
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: "EduRate",
  description: "Qarabağ Universiteti üçün müəllim qiymətləndirmələri, forum və dərs materialları platforması.",
  openGraph: {
    title: "EduRate",
    description: "Qarabağ Universiteti üçün müəllim qiymətləndirmələri, forum və dərs materialları platforması.",
    locale: "az_AZ",
    siteName: "EduRate",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="az"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full overflow-x-hidden bg-slate-50 text-gray-900">
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
