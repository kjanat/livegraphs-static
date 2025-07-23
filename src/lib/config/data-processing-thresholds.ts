/**
 * Data Processing Thresholds Configuration
 * Configuration for database operations, data processing, and chart display limits
 */

export const DATA_PROCESSING_THRESHOLDS = {
  // Database Storage
  database: {
    localStorageKey: "livegraphs_db",
    maxSizeMB: 4, // Maximum size before warning (localStorage typically has 5-10MB limit)
    sizeCalculationFactor: 0.75, // Base64 to binary size conversion factor
    mbConversionFactor: 1024 * 1024 // Bytes to MB conversion
  },

  // Time Calculations
  timeConversions: {
    millisecondsToSeconds: 1000,
    secondsToMinutes: 60,
    minutesToHours: 60,
    hoursToDay: 24
  },

  // Chart Display Limits
  charts: {
    topQuestions: 5, // Number of top questions to display
    topCategories: 10, // Number of top categories to display in cost analysis
    topCountries: 10, // Number of top countries to display
    topLanguages: 10, // Number of top languages to display
    questionTruncateLength: 50 // Maximum characters for question labels
  },

  // Cost Calculations
  costs: {
    centsToEur: 100 // Conversion factor from cents to euros
  },

  // Percentage Calculations
  percentages: {
    multiplier: 100 // Convert decimal to percentage
  },

  // Gauge Component
  gauge: {
    animationSpringbackDelay: 1000, // Delay before gauge springs back (ms)
    dragRadiusPadding: 20, // Padding from bottom of semicircle for drag calculation
    angleOffset: 90, // Offset to convert angle calculation
    semicircleAngle: 180 // Total angle of semicircle
  },

  // Error Boundaries
  errorRecovery: {
    maxRetryCount: 2 // Show additional help after this many retries
  },

  // UI Dimensions
  ui: {
    logoSizeMultiplier: 1.5 // Multiplier for logo size in error/404 pages
  }
} as const;

// Type-safe threshold getter
export function getDataProcessingThreshold<T extends keyof typeof DATA_PROCESSING_THRESHOLDS>(
  category: T
): (typeof DATA_PROCESSING_THRESHOLDS)[T] {
  return DATA_PROCESSING_THRESHOLDS[category];
}

// Helper functions for common conversions
export const convertToMinutes = (seconds: number): number => {
  return seconds / DATA_PROCESSING_THRESHOLDS.timeConversions.secondsToMinutes;
};

export const convertToEuros = (cents: number): number => {
  return cents / DATA_PROCESSING_THRESHOLDS.costs.centsToEur;
};

export const convertToPercentage = (decimal: number): number => {
  return decimal * DATA_PROCESSING_THRESHOLDS.percentages.multiplier;
};
