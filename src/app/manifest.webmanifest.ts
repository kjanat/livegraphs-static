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
