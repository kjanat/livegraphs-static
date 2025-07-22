/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <EnhancedLoadingState stage="processing" className="max-w-md w-full" />
    </div>
  );
}
