/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DATA_PROCESSING_THRESHOLDS } from "@/lib/config/data-processing-thresholds";
import { UI_DIMENSIONS } from "@/lib/constants/ui";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// Error types with specific recovery strategies
const ERROR_STRATEGIES = {
  DATABASE: {
    title: "Database Error",
    message: "There was an issue with the database. Try clearing your browser data.",
    actions: ["clearData", "reset"]
  },
  FILE_UPLOAD: {
    title: "File Upload Error",
    message: "The file could not be processed. Please check the file format.",
    actions: ["reset", "home"]
  },
  CHART_RENDER: {
    title: "Visualization Error",
    message: "The charts could not be rendered. Try refreshing the page.",
    actions: ["reset", "reload"]
  },
  DEFAULT: {
    title: "Something went wrong!",
    message: "We encountered an unexpected error. The error has been logged.",
    actions: ["reset", "home"]
  }
};

function getErrorStrategy(error: Error) {
  const errorMessage = error.message.toLowerCase();

  if (errorMessage.includes("database") || errorMessage.includes("sql")) {
    return ERROR_STRATEGIES.DATABASE;
  }
  if (
    errorMessage.includes("file") ||
    errorMessage.includes("upload") ||
    errorMessage.includes("json")
  ) {
    return ERROR_STRATEGIES.FILE_UPLOAD;
  }
  if (errorMessage.includes("chart") || errorMessage.includes("render")) {
    return ERROR_STRATEGIES.CHART_RENDER;
  }

  return ERROR_STRATEGIES.DEFAULT;
}

/**
 * React error boundary component for displaying user-friendly error messages and recovery options.
 *
 * Presents contextual error information, suggested actions, and developer diagnostics when an error occurs in the application. Offers options such as retrying, clearing browser data, reloading the page, or returning home, depending on the error type. Includes a reporting mechanism and detailed error output in development mode.
 *
 * @param error - The error object to display and analyze
 * @param reset - Callback to attempt recovery from the error
 * @returns The rendered error boundary UI
 */
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const strategy = getErrorStrategy(error);

  useEffect(() => {
    // Log the error with context
    const errorContext = {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      retryCount
    };

    console.error("Application error:", errorContext);

    // In production, you would send this to an error tracking service
    if (process.env.NODE_ENV === "production") {
      // Example: sendToErrorTrackingService(errorContext);
    }
  }, [error, retryCount]);

  const handleReset = () => {
    setRetryCount((prev) => prev + 1);
    reset();
  };

  const handleClearData = () => {
    if (typeof window !== "undefined") {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage
      sessionStorage.clear();
      // Clear IndexedDB if used
      if ("indexedDB" in window) {
        indexedDB.databases().then((databases) => {
          databases.forEach((db) => {
            if (db.name) indexedDB.deleteDatabase(db.name);
          });
        });
      }
      // Reload the page
      window.location.href = "/";
    }
  };

  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const handleReportIssue = async () => {
    setIsReporting(true);
    // In a real app, this would open a feedback form or send an automated report
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
    setIsReporting(false);
    alert("Thank you for reporting this issue. We'll investigate it promptly.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <Logo
          size={UI_DIMENSIONS.logoSize * DATA_PROCESSING_THRESHOLDS.ui.logoSizeMultiplier}
          className="text-primary mx-auto mb-6"
        />

        <h1 className="text-3xl font-bold mb-4">{strategy.title}</h1>

        <p className="text-muted-foreground mb-8">{strategy.message}</p>

        {retryCount > DATA_PROCESSING_THRESHOLDS.errorRecovery.maxRetryCount && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Multiple retry attempts detected. The issue might require clearing your browser data
              or contacting support.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {strategy.actions.includes("reset") && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto"
            >
              Try again {retryCount > 0 && `(Attempt ${retryCount + 1})`}
            </button>
          )}

          {strategy.actions.includes("clearData") && (
            <button
              type="button"
              onClick={handleClearData}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto"
            >
              Clear browser data & restart
            </button>
          )}

          {strategy.actions.includes("reload") && (
            <button
              type="button"
              onClick={handleReload}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto"
            >
              Reload page
            </button>
          )}

          {strategy.actions.includes("home") && (
            <div className="text-sm text-muted-foreground">
              <Link href="/" className="underline underline-offset-4 hover:text-primary">
                Return to home
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <button
            type="button"
            onClick={handleReportIssue}
            disabled={isReporting}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 disabled:opacity-50"
          >
            {isReporting ? "Reporting..." : "Report this issue"}
          </button>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 p-4 bg-muted rounded-lg text-left">
            <summary className="cursor-pointer text-sm font-medium mb-2">Error Details</summary>
            <ScrollArea className="h-[300px] w-full rounded-md">
              <div className="space-y-2 pr-4">
                {error.digest && (
                  <p className="text-xs font-mono text-muted-foreground">
                    <strong>Error ID:</strong> {error.digest}
                  </p>
                )}
                <p className="text-xs font-mono text-muted-foreground break-all">
                  <strong>Message:</strong> {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                    <strong>Stack:</strong>
                    {"\n"}
                    {error.stack}
                  </pre>
                )}
              </div>
            </ScrollArea>
          </details>
        )}
      </div>
    </div>
  );
}
