/**
 * Notso AI - Skip Navigation Links
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

export function SkipLinks() {
  return (
    <nav className="sr-only focus-within:not-sr-only" aria-label="Skip links">
      <a
        href="#main-content"
        className="absolute top-0 left-0 bg-primary text-primary-foreground px-4 py-2 m-3 rounded-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a
        href="#upload-section"
        className="absolute top-0 left-40 bg-primary text-primary-foreground px-4 py-2 m-3 rounded-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to upload
      </a>
      <a
        href="#charts-section"
        className="absolute top-0 left-80 bg-primary text-primary-foreground px-4 py-2 m-3 rounded-md focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to charts
      </a>
    </nav>
  );
}
