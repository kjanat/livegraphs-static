/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import Link from "next/link";

/**
 * Global error boundary that catches errors in the root layout
 * This is only active in production builds
 */
export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 font-sans">
          <div className="max-w-md w-full text-center">
            <h1 className="text-4xl font-bold mb-4">Critical Error</h1>

            <p className="text-gray-600 mb-8">
              A critical error occurred that prevented the application from loading.
            </p>

            <div className="space-y-4">
              <button
                type="button"
                onClick={reset}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Try again
              </button>

              <div>
                <Link href="/" className="text-blue-600 underline hover:text-blue-800">
                  Return to home
                </Link>
              </div>
            </div>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-gray-100 rounded text-left">
                <p className="text-xs font-mono text-gray-700">{error.message}</p>
                {error.digest && (
                  <p className="text-xs font-mono text-gray-500 mt-2">Error ID: {error.digest}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
