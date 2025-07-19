/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted py-6 text-center text-sm text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="mb-2">
          © 2025 Kaj Kowalski - Licensed under{" "}
          <a
            href="https://www.gnu.org/licenses/agpl-3.0.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline transition-colors"
          >
            AGPLv3
          </a>
        </p>
        <p>
          <a
            href="https://github.com/kjanat/livegraphs-static"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline transition-colors"
          >
            View Source Code
          </a>
          {" | "}
          <a
            href="https://github.com/kjanat/livegraphs-static/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline transition-colors"
          >
            Report Issues
          </a>
        </p>
      </div>
    </footer>
  );
}
