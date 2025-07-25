/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Footer } from "@/components/Footer";
import { StructuredData } from "@/components/StructuredData";
import { SkipLinks } from "@/components/ui/SkipLinks";
import { Toaster } from "@/components/ui/sonner";
import { WebVitals } from "@/components/WebVitals";
import { generateMetadata } from "@/lib/constants/metadata";
import { generateViewport } from "@/lib/constants/viewport";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true
});

export const metadata = generateMetadata();
export const viewport = generateViewport();

/**
 * Root layout component for the Notso AI web dashboard, providing global structure, theming, and accessibility features.
 *
 * Wraps all page content with font styles, theme provider, accessibility navigation, structured data, and global UI components such as footer and notifications.
 *
 * @param children - The content to be rendered within the layout
 */
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <StructuredData />
      </head>
      <body className="antialiased flex min-h-screen flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <WebVitals />
          <SkipLinks />
          {children}
          <Footer />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
