/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { RESPONSIVE_PADDING } from "@/lib/constants/ui";

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * Page container component - Server Component
 * Provides responsive padding and max-width constraints
 */
export function PageContainer({ children }: PageContainerProps) {
  // Responsive styles using constants
  const responsivePadding = {
    paddingLeft: `max(env(safe-area-inset-left, ${RESPONSIVE_PADDING.mobile.x}), ${RESPONSIVE_PADDING.mobile.x})`,
    paddingRight: `max(env(safe-area-inset-right, ${RESPONSIVE_PADDING.mobile.x}), ${RESPONSIVE_PADDING.mobile.x})`,
    paddingTop: `max(env(safe-area-inset-top, ${RESPONSIVE_PADDING.mobile.y}), ${RESPONSIVE_PADDING.mobile.y})`,
    paddingBottom: `max(env(safe-area-inset-bottom, ${RESPONSIVE_PADDING.mobile.y}), ${RESPONSIVE_PADDING.mobile.y})`
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 overflow-x-hidden"
      style={responsivePadding}
    >
      <div className="max-w-7xl mx-auto">{children}</div>
    </main>
  );
}
