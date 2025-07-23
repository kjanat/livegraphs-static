/**
 * Analytics Thresholds Configuration
 * Centralized configuration for all threshold values and constants used in
 * data quality assessment and insights analysis.
 */

export const ANALYTICS_THRESHOLDS = {
  // Sample Size Thresholds
  sampleSize: {
    verySmall: 10, // Below this: "Very Small Sample Size" error
    small: 50, // Below this: "Small Sample Size" warning
    minForQualityCheck: 30, // Minimum sessions to show data quality section
    minForInsights: 20 // Below this: "Limited Data Sample" warning
  },

  // Time Period Thresholds
  timePeriod: {
    shortDays: 3 // Below this: "Short Time Period" info
  },

  // Activity Volume Thresholds
  activity: {
    lowPerDay: 2, // Below this: "Low Activity Volume" warning
    highPerDay: 50, // Above this: "High Activity Volume" positive
    lowPerDayInsight: 10 // Below this: "Low Activity Volume" insight warning
  },

  // Response Time Thresholds (in seconds)
  responseTime: {
    slow: 10, // Above this: "Slow Response Times" in data quality
    slowInsight: 5, // Above this: "Slow Response Times" in insights
    fast: 2 // Below this: "Fast Response Times" positive
  },

  // Resolution/Escalation Rate Thresholds (in percentage)
  escalation: {
    high: 20, // Above this: "High Escalation Rate" warning
    low: 10, // Below this: "Effective Self-Service" positive
    suspiciousZero: 0, // Exactly 0: suspicious value warning
    suspicious100: 100 // Exactly 100: suspicious value warning
  },

  // User Satisfaction Thresholds
  rating: {
    excellent: 4.0, // Above or equal: "Excellent User Satisfaction"
    needsAttention: 3.0, // Below this: "User Satisfaction Needs Attention"
    perfectScore: 5.0, // Exactly 5.0: check for data collection issues
    zeroScore: 0, // Exactly 0: likely missing data
    // Minimum sessions for rating quality checks
    minSessionsForPerfectCheck: 20,
    minSessionsForZeroCheck: 10
  },

  // Category Quality Thresholds (in percentage)
  categorization: {
    highUnrecognized: 25 // Above this: "High Unrecognized Categories" warning
  },

  // HR Forwarding Thresholds
  hrForwarding: {
    minSessionsForZeroCheck: 50 // Min sessions to check for zero HR escalations
  },

  // Sentiment Analysis Thresholds (in percentage)
  sentiment: {
    highNegative: 30 // Above this: "High Negative Sentiment" warning
  },

  // Data Quality Display Thresholds
  qualityDisplay: {
    // Show data quality section if any of these conditions are met:
    // - Error level issues exist
    // - High impact warnings exist
    // - Total sessions below this threshold
    alwaysShowBelowSessions: 30
  }
} as const;

// Type-safe threshold getter with path
export function getThreshold<T extends keyof typeof ANALYTICS_THRESHOLDS>(
  category: T
): (typeof ANALYTICS_THRESHOLDS)[T] {
  return ANALYTICS_THRESHOLDS[category];
}

// Impact levels for quality issues
export const IMPACT_LEVELS = {
  high: "high",
  medium: "medium",
  low: "low"
} as const;

export type ImpactLevel = (typeof IMPACT_LEVELS)[keyof typeof IMPACT_LEVELS];

// Issue types for quality assessment
export const ISSUE_TYPES = {
  error: "error",
  warning: "warning",
  info: "info"
} as const;

export type IssueType = (typeof ISSUE_TYPES)[keyof typeof ISSUE_TYPES];
