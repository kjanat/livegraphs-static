/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Static Tailwind grid classes mapping to avoid dynamic class generation
// Tailwind needs these at compile time for proper CSS generation
export const GRID_COLS_MAP = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7"
} as const;

/**
 * Returns the Tailwind CSS grid column class for a specified number of columns, clamped between 1 and 7.
 *
 * @param count - Desired number of grid columns
 * @returns The corresponding Tailwind CSS grid column class for large screens
 */
export function getGridColsClass(count: number): string {
  // Clamp to supported range
  const safeCount = Math.min(Math.max(1, count), 7) as keyof typeof GRID_COLS_MAP;
  return GRID_COLS_MAP[safeCount];
}

// Tab navigation constants
export const TAB_NAVIGATION = {
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End"
} as const;

// Storage keys
export const TAB_STORAGE_KEY = "livegraphs_selected_chart_tab";
