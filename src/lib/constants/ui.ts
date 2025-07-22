/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Breakpoint constants
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
} as const;

// Toast durations
export const TOAST_DURATIONS = {
  default: 4000,
  success: 3000,
  error: 5000,
  confirmation: 60000 // 1 minute for confirmations
} as const;

// Chart visibility thresholds
export const CHART_VISIBILITY = {
  minSessionsForAnalytics: 10,
  minCountriesForMap: 2,
  minLanguagesForChart: 2
} as const;

// UI Dimensions
export const UI_DIMENSIONS = {
  logoSize: 48,
  maxToastWidth: "max-w-md",
  minButtonHeight: 44 // Mobile touch target
} as const;

// Animation durations (ms)
export const ANIMATION_DURATIONS = {
  fast: 200,
  normal: 300,
  slow: 500,
  spring: 800
} as const;

// File upload
export const FILE_UPLOAD = {
  acceptedTypes: [".json"],
  maxFileSizeMB: 50
} as const;

// Responsive padding with safe area insets
export const RESPONSIVE_PADDING = {
  mobile: {
    x: "1rem",
    y: "1.5rem"
  },
  desktop: {
    x: "2rem",
    y: "2.5rem"
  }
} as const;
