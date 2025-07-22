/**
 * Notso AI - Empty State Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { BarChart3, File } from "lucide-react";

interface EmptyStateProps {
  onSampleData?: () => void;
  onUploadClick?: () => void;
  onFileUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EmptyState({ onSampleData, onUploadClick, onFileUpload }: EmptyStateProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 sm:p-12 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Animated SVG Illustration */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full animate-pulse" />
            </div>
            <div className="relative flex items-center justify-center">
              <File
                size={48}
                className="text-primary/50 animate-in slide-in duration-700 delay-200"
              />
              <BarChart3
                size={48}
                className="text-primary ml-4 animate-in slide-in duration-700 delay-400"
              />
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Transform Your Chatbot Data Into Insights
          </h2>

          <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
            Upload your conversation logs and instantly discover user satisfaction trends,
            performance bottlenecks, and optimization opportunities through intelligent analytics.
          </p>

          {onSampleData && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                onClick={onSampleData}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-8 rounded-lg transition-colors text-lg"
              >
                Try Sample Data
              </button>
              {onFileUpload ? (
                <label className="text-primary hover:text-primary/80 underline transition-colors cursor-pointer">
                  or upload your own data
                  <input
                    type="file"
                    accept=".json"
                    onChange={onFileUpload}
                    className="hidden"
                    aria-label="Upload JSON file"
                  />
                </label>
              ) : onUploadClick ? (
                <button
                  type="button"
                  onClick={onUploadClick}
                  className="text-primary hover:text-primary/80 underline transition-colors"
                >
                  or upload your own data
                </button>
              ) : (
                <span className="text-muted-foreground">or upload your own data</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Value Proposition */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-500 mb-2">📊</div>
          <h3 className="font-semibold mb-2">Smart Insights</h3>
          <p className="text-sm text-muted-foreground">
            AI-generated findings highlight critical patterns and recommendations
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-500 mb-2">🎯</div>
          <h3 className="font-semibold mb-2">Progressive Disclosure</h3>
          <p className="text-sm text-muted-foreground">
            Essential metrics first, detailed analytics when you need them
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-purple-500 mb-2">🔒</div>
          <h3 className="font-semibold mb-2">Privacy First</h3>
          <p className="text-sm text-muted-foreground">
            All processing happens in your browser - no data leaves your device
          </p>
        </div>

        <div className="bg-card rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-orange-500 mb-2">⚡</div>
          <h3 className="font-semibold mb-2">Instant Results</h3>
          <p className="text-sm text-muted-foreground">
            Real-time analytics with interactive charts and export capabilities
          </p>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="bg-card rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">What You&apos;ll Discover</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Essential Overview</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                User sentiment distribution
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Resolution success rates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Interactive satisfaction ratings
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Performance Intelligence</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Response time trends
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Weekly usage heatmaps
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Cost analysis by category
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Data Format Guide */}
      <div className="bg-card rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Data Format</h3>
        <div className="bg-secondary/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">
            Your JSON file should contain a{" "}
            <code className="px-1 py-0.5 bg-background rounded text-foreground">sessions</code>{" "}
            array with conversation data. View the full{" "}
            <a
              href="https://raw.githubusercontent.com/kjanat/livegraphs-static/master/public/data-schema.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              JSON Schema
            </a>{" "}
            for detailed specifications.
          </p>
          <pre className="text-sm text-muted-foreground overflow-x-auto">
            {`{
  "sessions": [{
    "session_id": "unique_id",
    "start_time": "2025-01-15T10:30:00Z",
    "end_time": "2025-01-15T10:35:00Z",
    "questions": "How to reset password?",
    "category": "Support",
    "sentiment": "positive",
    "escalated": 0,
    "avg_response_time": 2.5,
    "tokens_eur": 0.003,
    "rating": 4
  }]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
