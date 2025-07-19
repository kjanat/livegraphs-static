/**
 * Notso AI - Theme-aware chart colors
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Get theme-aware colors from CSS custom properties
export function getChartColors() {
  if (typeof window === "undefined") {
    // Server-side default colors
    return {
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
  }

  const style = getComputedStyle(document.documentElement);

  return {
    primary: style.getPropertyValue("--primary").trim() || "#3b82f6",
    secondary: style.getPropertyValue("--secondary").trim() || "#f3f4f6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#8b5cf6",
    muted: style.getPropertyValue("--muted-foreground").trim() || "#6b7280",
    background: style.getPropertyValue("--background").trim() || "#ffffff",
    foreground: style.getPropertyValue("--foreground").trim() || "#171717",
    // Chart-specific colors that work in both themes
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    pink: "#ec4899",
    teal: "#14b8a6",
    orange: "#fb923c"
  };
}

// Get a specific chart color palette
export function getChartPalette(_isDark?: boolean): string[] {
  // These colors are chosen to work well in both light and dark themes
  return [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // yellow
    "#ef4444", // red
    "#8b5cf6", // purple
    "#14b8a6", // teal
    "#ec4899", // pink
    "#fb923c" // orange
  ];
}

// Add transparency to a hex color
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
