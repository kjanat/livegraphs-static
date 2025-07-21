/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect } from "react";
import ReactDOM from "react-dom";

/**
 * Component to provide resource hints for better performance
 * Uses ReactDOM experimental methods for preconnecting and prefetching DNS
 */
export function ResourceHints() {
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    // Preconnect to Google Fonts for faster font loading
    if (typeof ReactDOM.preconnect === "function") {
      ReactDOM.preconnect("https://fonts.googleapis.com", {
        crossOrigin: "anonymous"
      });
      ReactDOM.preconnect("https://fonts.gstatic.com", {
        crossOrigin: "anonymous"
      });
    }

    // Prefetch DNS for any external CDNs if used in the future
    if (typeof ReactDOM.prefetchDNS === "function") {
      // Example: ReactDOM.prefetchDNS("https://cdn.jsdelivr.net");
    }
  }, []);

  return null;
}
