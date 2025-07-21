/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import Link from "next/link";
import { useEffect } from "react";
import Logo from "@/components/Logo";
import { UI_DIMENSIONS } from "@/lib/constants/ui";

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Logo size={UI_DIMENSIONS.logoSize * 1.5} className="text-primary mx-auto mb-6" />

        <h1 className="text-3xl font-bold mb-4">Something went wrong!</h1>

        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error. The error has been logged and we&apos;ll look into it.
        </p>

        <div className="space-y-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Try again
          </button>

          <div className="text-sm text-muted-foreground">
            <Link href="/" className="underline underline-offset-4 hover:text-primary">
              Return to home
            </Link>
          </div>
        </div>

        {process.env.NODE_ENV === "development" && error.digest && (
          <div className="mt-8 p-4 bg-muted rounded-lg text-left">
            <p className="text-xs font-mono text-muted-foreground">Error ID: {error.digest}</p>
          </div>
        )}
      </div>
    </div>
  );
}
