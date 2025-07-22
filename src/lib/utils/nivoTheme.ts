/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Get Nivo theme configuration based on dark mode state
 * @param isDarkMode - Whether dark mode is active
 * @returns Nivo theme configuration
 */
export function getNivoTheme(isDarkMode: boolean) {
  return {
    background: "transparent",
    text: {
      fontSize: 12,
      fill: isDarkMode ? "#e5e7eb" : "#1f2937"
    },
    axis: {
      domain: {
        line: {
          stroke: isDarkMode ? "#4b5563" : "#d1d5db"
        }
      },
      ticks: {
        line: {
          stroke: isDarkMode ? "#4b5563" : "#d1d5db"
        },
        text: {
          fill: isDarkMode ? "#9ca3af" : "#6b7280"
        }
      },
      legend: {
        text: {
          fill: isDarkMode ? "#e5e7eb" : "#1f2937"
        }
      }
    },
    grid: {
      line: {
        stroke: isDarkMode ? "#374151" : "#e5e7eb"
      }
    },
    labels: {
      text: {
        fontSize: 12,
        fill: isDarkMode ? "#e5e7eb" : "#1f2937"
      }
    },
    tooltip: {
      container: {
        background: isDarkMode ? "#1f2937" : "#ffffff",
        color: isDarkMode ? "#e5e7eb" : "#1f2937",
        fontSize: 12,
        borderRadius: 4,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
      }
    }
  };
}

/**
 * Get tooltip styles for custom Nivo tooltips
 * @param isDarkMode - Whether dark mode is active
 * @returns React style object for tooltip
 */
export function getNivoTooltipStyles(isDarkMode: boolean): React.CSSProperties {
  return {
    padding: "8px 12px",
    background: isDarkMode ? "#1f2937" : "#ffffff",
    color: isDarkMode ? "#e5e7eb" : "#1f2937",
    border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };
}
