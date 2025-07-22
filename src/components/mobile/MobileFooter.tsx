/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Info } from "lucide-react";
import { useState } from "react";

export function MobileFooter() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      {/* Floating info button */}
      <button
        type="button"
        onClick={() => setShowInfo(!showInfo)}
        className="fixed bottom-4 right-4 p-2 bg-muted rounded-full shadow-md hover:shadow-lg transition-all z-10"
        aria-label="Show information"
      >
        <Info className="h-4 w-4 text-muted-foreground" />
      </button>

      {/* Info overlay */}
      {showInfo && (
        <>
          <button
            type="button"
            className="fixed inset-0 bg-black/50 z-20"
            onClick={() => setShowInfo(false)}
            aria-label="Close information panel"
          />
          <div className="fixed bottom-0 left-0 right-0 bg-card rounded-t-xl p-4 z-30 shadow-lg">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                © 2025 Kaj Kowalski - Licensed under{" "}
                <a
                  href="https://www.gnu.org/licenses/agpl-3.0.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  AGPLv3
                </a>
              </p>
              <div className="flex gap-3 text-xs">
                <a
                  href="https://github.com/notsoai/livegraphs-static"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  View Source
                </a>
                <span className="text-muted-foreground">•</span>
                <a
                  href="https://github.com/notsoai/livegraphs-static/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Report Issues
                </a>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="mt-3 w-full py-2 text-xs font-medium bg-muted rounded-md hover:bg-muted/80 transition-colors"
            >
              Close
            </button>
          </div>
        </>
      )}
    </>
  );
}
