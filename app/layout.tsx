/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Footer } from "@/components/Footer";
import { SkipLinks } from "@/components/ui/SkipLinks";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Notso AI - Chatbot Analytics Dashboard",
  description: "Visualize and analyze chatbot conversation data with interactive charts",
  icons: {
    icon: [
      { url: "./favicon.svg", type: "image/svg+xml" },
      { url: "./favicon-256x256.png", sizes: "256x256" },
      { url: "./favicon-128x128.png", sizes: "128x128" },
      { url: "./favicon-64x64.png", sizes: "64x64" },
      { url: "./favicon-32x32.png", sizes: "32x32" },
      { url: "./favicon-16x16.png", sizes: "16x16" }
    ],
    apple: [{ url: "./apple-touch-icon.png", sizes: "180x180" }]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased flex min-h-screen flex-col">
        <ThemeProvider>
          <SkipLinks />
          {children}
          <Footer />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
