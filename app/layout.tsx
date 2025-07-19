/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      {
        url: "notso-black.svg",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "notso-white.svg",
        media: "(prefers-color-scheme: dark)"
      }
    ]
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
        </ThemeProvider>
      </body>
    </html>
  );
}
