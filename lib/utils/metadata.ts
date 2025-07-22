/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { Metadata } from "next";
import { SITE_CONFIG } from "@/lib/constants/metadata";

interface MetadataOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Generate page-specific metadata with fallbacks
 */
export function generatePageMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title = SITE_CONFIG.title,
    description = SITE_CONFIG.description,
    path = "",
    image = SITE_CONFIG.ogImage,
    noIndex = false,
    keywords = [...SITE_CONFIG.keywords]
  } = options;

  const url = `${SITE_CONFIG.url}${path}`;
  const fullTitle = title === SITE_CONFIG.title ? title : `${title} | ${SITE_CONFIG.name}`;

  return {
    title: fullTitle,
    description,
    keywords,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle
        }
      ],
      locale: "en_US",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: `@${SITE_CONFIG.creator.replace(" ", "")}`
    },
    alternates: {
      canonical: url
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        noimageindex: noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    other: {
      "msapplication-TileColor": "#000000",
      "theme-color": "#000000"
    }
  };
}

/**
 * Generate title template for consistent formatting
 */
export function generateTitleTemplate(pageTitle: string, suffix = SITE_CONFIG.name): string {
  return `${pageTitle} | ${suffix}`;
}

/**
 * Generate description with length validation
 */
export function generateDescription(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;

  // Truncate at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  return lastSpace > 0 ? `${truncated.substring(0, lastSpace)}...` : `${truncated}...`;
}
