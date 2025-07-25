/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Measures the pixel width of text using Canvas API
 * @param text - The text to measure
 * @param font - CSS font string (e.g., "12px Arial")
 * @returns Width in pixels
 */
export function measureTextWidth(text: string, font = "12px Arial"): number {
  if (typeof window === "undefined") {
    // SSR fallback: estimate based on character count
    return text.length * 7; // Rough estimate
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return text.length * 7; // Fallback
  }

  context.font = font;
  return context.measureText(text).width;
}

/**
 * Truncates text to fit within a specific pixel width
 * @param text - The text to truncate
 * @param maxWidth - Maximum width in pixels
 * @param font - CSS font string (e.g., "12px Arial")
 * @param ellipsis - String to append when truncating (default: "...")
 * @returns Truncated text with ellipsis if needed
 */
export function truncateToFitWidth(
  text: string,
  maxWidth: number,
  font = "12px Arial",
  ellipsis = "..."
): string {
  const textWidth = measureTextWidth(text, font);

  // If text already fits, return as-is
  if (textWidth <= maxWidth) {
    return text;
  }

  // Binary search for optimal truncation point
  let left = 0;
  let right = text.length;
  let result = "";

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const truncated = text.substring(0, mid) + ellipsis;
    const width = measureTextWidth(truncated, font);

    if (width <= maxWidth) {
      result = truncated;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  // Ensure we don't return just the ellipsis
  if (result === ellipsis && text.length > 0) {
    return text.charAt(0) + ellipsis;
  }

  return result;
}

/**
 * Custom label props interface for Recharts
 * Matches the Props type from Recharts LabelList
 */
export interface CustomLabelProps {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
  index?: number;
  offset?: number;
  position?: string | { x?: number; y?: number }; // Can be string or object
  className?: string;
  fontSize?: string | number;
  fill?: string;
}
