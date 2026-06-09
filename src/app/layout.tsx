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
  title: "TableNow — Be first to the table",
  description:
    "We watch Resy and OpenTable for the restaurants you want — with a far wider net than their search allows — and alert you the moment a table opens. You book it in one tap.",
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
