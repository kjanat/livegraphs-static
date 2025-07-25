/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { FooterContent } from "./FooterContent";

/**
 * Renders the site footer with consistent styling and content for medium and larger screens.
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted py-6 text-center text-sm text-muted-foreground hidden md:block">
      <div className="container mx-auto px-4">
        <FooterContent />
      </div>
    </footer>
  );
}
