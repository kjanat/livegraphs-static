/**
 * Notso AI - Theme-aware chart colors
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Type definition for chart colors
export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  muted: string;
  background: string;
  foreground: string;
  blue: string;
  green: string;
  red: string;
  yellow: string;
  purple: string;
  pink: string;
  teal: string;
  orange: string;
}

// Default color palette constant
const DEFAULT_COLORS: ChartColors = {
  primary: "#3b82f6",
  secondary: "#f3f4f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#8b5cf6",
  muted: "#6b7280",
  background: "#ffffff",
  foreground: "#171717",
  // Chart-specific colors
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  yellow: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  teal: "#14b8a6",
  orange: "#fb923c"
};

// Get theme-aware colors from CSS custom properties
export function getChartColors(): ChartColors {
  if (typeof window === "undefined") {
    // Server-side: return default colors
    return DEFAULT_COLORS;
  }

  const style = getComputedStyle(document.documentElement);

  // Client-side: merge CSS custom properties with defaults
  return {
    ...DEFAULT_COLORS,
    primary: style.getPropertyValue("--primary").trim() || DEFAULT_COLORS.primary,
    secondary: style.getPropertyValue("--secondary").trim() || DEFAULT_COLORS.secondary,
    muted: style.getPropertyValue("--muted-foreground").trim() || DEFAULT_COLORS.muted,
    background: style.getPropertyValue("--background").trim() || DEFAULT_COLORS.background,
    foreground: style.getPropertyValue("--foreground").trim() || DEFAULT_COLORS.foreground
  };
}

// Add transparency to a hex color
export function hexToRgba(hex: string, alpha: number): string {
  // Validate hex format
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected format: #RRGGBB`);
  }

  // Validate alpha range
  if (alpha < 0 || alpha > 1) {
    throw new Error(`Invalid alpha value: ${alpha}. Must be between 0 and 1`);
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
