/**
 * Sample Data Generation Thresholds Configuration
 * Configuration for generating realistic sample data patterns
 */

export const SAMPLE_DATA_THRESHOLDS = {
  // Time ranges
  timeRanges: {
    workingHoursStart: 8, // Start of working hours
    workingHoursEnd: 20, // End of working hours
    conversationMinDuration: 2, // Minimum conversation duration in minutes
    conversationMaxDuration: 20 // Maximum conversation duration in minutes
  },

  // Message counts
  messages: {
    minCount: 2, // Minimum messages per conversation
    maxCount: 15, // Maximum messages per conversation
    tokensPerMessageMin: 50, // Minimum tokens per message
    tokensPerMessageMax: 200, // Maximum tokens per message
    tokenCostPerUnit: 0.002 // Cost per token in cents
  },

  // Response times
  responseTime: {
    minSeconds: 1, // Minimum response time in seconds
    maxSeconds: 10, // Maximum response time in seconds
    slowResponseThreshold: 7 // Above this is considered slow
  },

  // Escalation logic
  escalation: {
    baseChanceNegative: 0.5, // Base chance for negative sentiment
    baseChanceOther: 0.1, // Base chance for other sentiments
    negativeKeywordModifier: 0.3, // Additional chance if negative keywords
    slowResponseModifier: 0.2 // Additional chance if slow response
  },

  // Categorization
  categorization: {
    unrecognizedChance: 0.15 // 15% chance for "Unrecognized / Other"
  },

  // Rating ranges
  ratings: {
    positiveMin: 4,
    positiveMax: 5,
    negativeMin: 1,
    negativeMax: 3,
    neutralMin: 3,
    neutralMax: 4
  },

  // Session generation patterns
  sessionPatterns: {
    weekendActivityFactor: 0.3, // 30% of normal activity on weekends
    summerActivityFactor: 0.7, // 70% of normal activity in summer months
    summerMonthStart: 5, // June (0-indexed)
    summerMonthEnd: 7, // August (0-indexed)
    baseSessionsPerDayMin: 2,
    baseSessionsPerDayMax: 5
  },

  // IP address generation
  ipGeneration: {
    firstOctetMin: 1,
    firstOctetMax: 223,
    lastOctetMin: 1,
    lastOctetMax: 254
  },

  // Session ID generation
  sessionIdGeneration: {
    randomPartMin: 1000,
    randomPartMax: 9999,
    longRandomMin: 100000000000,
    longRandomMax: 999999999999
  },

  // Default history length
  defaultHistoryDays: 365 // One year of data by default
} as const;

/**
 * Retrieves the specified sample data threshold configuration category in a type-safe manner.
 *
 * @param category - The key of the threshold category to retrieve
 * @returns The configuration object for the specified threshold category
 */
export function getSampleDataThreshold<T extends keyof typeof SAMPLE_DATA_THRESHOLDS>(
  category: T
): (typeof SAMPLE_DATA_THRESHOLDS)[T] {
  return SAMPLE_DATA_THRESHOLDS[category];
}
