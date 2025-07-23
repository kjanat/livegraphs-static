/**
 * Dashboard Configuration
 * Centralized configuration for dashboard behavior and defaults
 */

export const DASHBOARD_CONFIG = {
  /**
   * Default date range behavior when loading data
   * Options:
   * - 'all': Load all available data
   * - 'last-month': Load last 30 days
   * - 'last-3-months': Load last 90 days
   * - 'last-week': Load last 7 days
   * - number: Custom number of days to load
   */
  defaultDateRange: "all" as "all" | "last-month" | "last-3-months" | "last-week" | number,

  /**
   * Whether to automatically load data when date range is available
   */
  autoLoadData: true,

  /**
   * Maximum number of sessions to display in charts
   * (for performance optimization)
   */
  maxSessionsInCharts: 10000,

  /**
   * Default chart types to show on dashboard
   */
  defaultCharts: {
    overview: true,
    performance: true,
    geographic: true,
    cost: true,
    detailed: true
  },

  /**
   * Date format for display
   */
  dateFormat: "MMM dd, yyyy",

  /**
   * Time format for display
   */
  timeFormat: "HH:mm"
} as const;

export type DashboardConfig = typeof DASHBOARD_CONFIG;
