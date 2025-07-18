/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notso AI - Chatbot Analytics Dashboard",
  description: "Visualize and analyze chatbot conversation data with interactive charts",
  icons: {
    icon: [
      {
        url: "/notsoAI-black.svg",
        media: "(prefers-color-scheme: light)"
      },
      {
        url: "/notsoAI-white.svg",
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
    <html lang="en">
      <body className="font-sans antialiased flex min-h-screen flex-col">
        {children}
        <Footer />
      </body>
    </html>
  );
}
