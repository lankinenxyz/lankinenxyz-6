import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    </html>
  );
}
