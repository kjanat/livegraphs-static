/**
 * Notso AI - Enhanced Loading States with Contextual Messages
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EnhancedLoadingStateProps {
  stage: "metrics" | "charts" | "processing";
  totalSessions?: number;
  className?: string;
}

const loadingMessages = {
  metrics: [
    "Analyzing conversation patterns...",
    "Calculating key performance indicators...",
    "Processing user sentiment data...",
    "Computing response time metrics...",
    "Analyzing resolution rates..."
  ],
  charts: [
    "Preparing visualizations...",
    "Generating interactive charts...",
    "Organizing data by categories...",
    "Creating geographic insights...",
    "Building performance trends..."
  ],
  processing: [
    "Validating data structure...",
    "Loading sessions into database...",
    "Optimizing for analysis...",
    "Preparing insights engine...",
    "Initializing chart components..."
  ]
};

const stageDescriptions = {
  metrics: "Computing Analytics",
  charts: "Building Visualizations",
  processing: "Processing Data"
};

export function EnhancedLoadingState({
  stage,
  totalSessions,
  className = ""
}: EnhancedLoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = loadingMessages[stage];
  const stageDescription = stageDescriptions[stage];

  useEffect(() => {
    // Rotate through messages every 2 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.random() * 15 + 5; // Random increment between 5-20%
        return Math.min(prev + increment, 90); // Cap at 90% to avoid false completion
      });
    }, 800);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [messages.length]);

  const getEstimatedTime = () => {
    if (!totalSessions) return "a few seconds";
    if (totalSessions < 100) return "a few seconds";
    if (totalSessions < 1000) return "10-15 seconds";
    if (totalSessions < 5000) return "30-45 seconds";
    return "1-2 minutes";
  };

  const getDataInsight = () => {
    if (!totalSessions) return null;
    if (totalSessions < 50) return "Small dataset - fast processing";
    if (totalSessions < 500) return "Medium dataset - generating insights";
    if (totalSessions < 2000) return "Large dataset - comprehensive analysis";
    return "Very large dataset - detailed insights coming";
  };

  return (
    <div
      className={`bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 text-center ${className}`}
    >
      <div className="max-w-md mx-auto">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full animate-ping" />
          </div>
          <div className="relative flex items-center justify-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        </div>

        {/* Stage Title */}
        <h3 className="text-xl font-bold mb-2 text-foreground">{stageDescription}</h3>

        {/* Current Message */}
        <p className="text-muted-foreground mb-4 min-h-[1.5rem] transition-all duration-500">
          {messages[currentMessageIndex]}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Context Information */}
        <div className="space-y-2 text-sm text-muted-foreground">
          {totalSessions && (
            <div className="flex justify-between items-center">
              <span>Processing:</span>
              <span className="font-medium">{totalSessions.toLocaleString()} sessions</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span>Estimated time:</span>
            <span className="font-medium">{getEstimatedTime()}</span>
          </div>
          {getDataInsight() && (
            <div className="mt-3 px-3 py-2 bg-primary/10 rounded-lg text-primary text-center">
              {getDataInsight()}
            </div>
          )}
        </div>

        {/* Performance Tip */}
        <div className="mt-6 text-xs text-muted-foreground border-t pt-4">
          💡 All processing happens in your browser - your data never leaves your device
        </div>
      </div>
    </div>
  );
}
