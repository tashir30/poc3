import type { Metadata, Viewport } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import { PwaRegister } from "@/components/shared/PwaRegister";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Elevo — Catalog + inventory",
  description: "Share your product catalog on WhatsApp with inventory your team can manage",
  applicationName: "Elevo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Catalog",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${oswald.variable} h-full`}>
      <body className="min-h-full bg-background font-sans text-slate-900 antialiased">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
