/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Notso AI - Chatbot Analytics Dashboard",
    short_name: "Notso AI",
    description: "Visualize and analyze chatbot conversation data with interactive charts",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml"
      },
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png"
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png"
      },
      {
        src: "/favicon-64x64.png",
        sizes: "64x64",
        type: "image/png"
      },
      {
        src: "/favicon-128x128.png",
        sizes: "128x128",
        type: "image/png"
      },
      {
        src: "/favicon-256x256.png",
        sizes: "256x256",
        type: "image/png"
      }
    ],
    categories: ["business", "productivity", "utilities"],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "Desktop view of Notso AI Dashboard"
      }
    ]
  };
}
