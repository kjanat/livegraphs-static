/**
 * Notso AI - Empty State Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ChartIcon, FileIcon } from "@/components/icons";

interface EmptyStateProps {
  onSampleData?: () => void;
}

export function EmptyState({ onSampleData }: EmptyStateProps) {
  return (
    <div className="bg-card rounded-lg shadow-md p-8 sm:p-12 text-center animate-in fade-in duration-500">
      <div className="max-w-md mx-auto">
        {/* Animated SVG Illustration */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
          </div>
          <div className="relative flex items-center justify-center">
            <FileIcon
              size={48}
              className="text-primary/50 animate-in slide-in duration-700 delay-200"
            />
            <ChartIcon
              size={48}
              className="text-primary ml-4 animate-in slide-in duration-700 delay-400"
            />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Welcome to Notso AI Analytics</h2>

        <p className="text-muted-foreground mb-8 text-lg">
          Upload your chatbot conversation data to unlock powerful insights and visualizations.
        </p>

        <div className="space-y-4">
          <div className="bg-secondary/50 p-4 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Expected JSON Format:</h3>
            <pre className="text-sm text-muted-foreground overflow-x-auto">
              {`{
  "sessions": [{
    "session_id": "string",
    "start_time": "ISO date",
    "end_time": "ISO date",
    "questions": "string",
    "category": "string",
    "sentiment": "string",
    "escalated": 0 | 1,
    "tokens_eur": number,
    ...
  }]
}`}
            </pre>
          </div>

          {onSampleData && (
            <button
              type="button"
              onClick={onSampleData}
              className="w-full sm:w-auto bg-secondary hover:bg-secondary/80 text-foreground font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Load Sample Data
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">10+</div>
            <div className="text-sm text-muted-foreground">Chart Types</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">Real-time</div>
            <div className="text-sm text-muted-foreground">Analytics</div>
          </div>
          <div className="p-4">
            <div className="text-3xl font-bold text-primary mb-2">CSV</div>
            <div className="text-sm text-muted-foreground">Export</div>
          </div>
        </div>
      </div>
    </div>
  );
}
