/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Link from "next/link";
import Logo from "@/components/Logo";
import { DATA_PROCESSING_THRESHOLDS } from "@/lib/config/data-processing-thresholds";
import { UI_DIMENSIONS } from "@/lib/constants/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Logo
          size={UI_DIMENSIONS.logoSize * DATA_PROCESSING_THRESHOLDS.ui.logoSizeMultiplier}
          className="text-primary mx-auto mb-6"
        />

        <h1 className="text-6xl font-bold mb-4">404</h1>

        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>

        <p className="text-muted-foreground mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or
          doesn&apos;t exist.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
