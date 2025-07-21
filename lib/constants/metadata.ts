/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "Notso AI",
  title: "Notso AI - Chatbot Analytics Dashboard",
  description: "Visualize and analyze chatbot conversation data with interactive charts",
  url: "https://notso.ai", // Update with actual URL
  ogImage: "/og-image.png", // Update with actual OG image
  creator: "Kaj Kowalski",
  keywords: [
    "chatbot analytics",
    "conversation analysis",
    "data visualization",
    "interactive dashboard",
    "AI metrics",
    "chat statistics"
  ]
} as const;

export const FONT_CONFIG = {
  sans: {
    variable: "--font-geist-sans",
    subsets: ["latin"] as Array<"latin" | "latin-ext" | "cyrillic">
  },
  mono: {
    variable: "--font-geist-mono",
    subsets: ["latin"] as Array<"latin" | "latin-ext" | "cyrillic">
  }
};

export const ICON_SIZES = [16, 32, 64, 128, 256] as const;

export const generateMetadata = (): Metadata => ({
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.creator }],
  creator: SITE_CONFIG.creator,
  openGraph: {
    type: "website",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: [
      { url: "./favicon.svg", type: "image/svg+xml" },
      ...ICON_SIZES.map((size) => ({
        url: `./favicon-${size}x${size}.png`,
        sizes: `${size}x${size}`
      }))
    ],
    apple: [{ url: "./apple-touch-icon.png", sizes: "180x180" }]
  }
});
