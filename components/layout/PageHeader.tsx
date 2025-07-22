/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Logo from "@/components/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UI_DIMENSIONS } from "@/lib/constants/ui";

/**
 * Page header component - Server Component
 * Renders static header content without requiring JavaScript
 */
export function PageHeader() {
  return (
    <header className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-8">
      <div className="flex items-center gap-2 sm:gap-4">
        <Logo size={UI_DIMENSIONS.logoSize} className="text-primary flex-shrink-0" />
        <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold">Notso AI Dashboard</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
