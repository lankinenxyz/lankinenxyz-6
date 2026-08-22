import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Tag IDs are public (they ship in the page HTML), so this is not an env value.
// This is the Google tag ID, not the G-D2MFN50BT9 measurement ID. That measurement ID is only
// a destination inside this tag and has no loader container of its own, so requesting
// gtag/js?id=G-... returns a 404 HTML page that Chrome then blocks via ORB. Loading the tag
// ID configures its destinations, so page views still land in G-D2MFN50BT9.
const gaMeasurementId = "GT-NCTZ3HRB";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lankinen.xyz"),
  title: {
    default: "lankinen.xyz",
    template: "%s | lankinen.xyz",
  },
  description: "Personal website of Elias Lankinen. Projects, notes, books, and other hobbies.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "lankinen.xyz",
    description: "Projects, notes, books, and other hobbies by Elias Lankinen.",
    url: "/",
    siteName: "lankinen.xyz",
    images: [
      {
        url: "/preview.png",
        width: 1600,
        height: 900,
        alt: "lankinen.xyz website preview with globe visitor analytics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "lankinen.xyz",
    description: "Projects, notes, books, and other hobbies by Elias Lankinen.",
    images: ["/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
      <Analytics />
      <GoogleAnalytics gaId={gaMeasurementId} />
    </html>
  );
}
