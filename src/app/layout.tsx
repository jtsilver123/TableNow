import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ToastHost } from "@/components/toast";
import "./globals.css";

/** Elegant editorial serif for display headings. */
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

/** Clean, highly readable sans for UI and body text. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TableNow — Hard-to-get reservations, handled",
  description:
    "Tell us where you want to go, connect your Resy or OpenTable account, and we'll automatically book when a table opens. Your first successful reservation is free.",
};

export const viewport: Viewport = {
  themeColor: "#F7F4ED",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <ToastHost />
      </body>
    </html>
  );
}
