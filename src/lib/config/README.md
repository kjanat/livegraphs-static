# Configuration Directory

This directory contains centralized configuration files for the LiveGraphs application.

## Files

### [`analytics-thresholds.ts`](./analytics-thresholds.ts)

Contains all threshold values and constants used for:

- Data quality assessment checks
- Key insights generation
- Suspicious value detection
- Display logic conditions

### [`dashboard.ts`](./dashboard.ts)

Contains dashboard-specific configuration like default date ranges and display preferences.

### [`data-processing-thresholds.ts`](./data-processing-thresholds.ts)

Contains configuration for data processing and UI elements:

- Database storage limits and keys
- Time conversion factors
- Chart display limits (top N items)
- Cost calculations
- Percentage conversions
- Gauge component behavior
- Error recovery settings
- UI dimensions

### [`sample-data-thresholds.ts`](./sample-data-thresholds.ts)

Contains configuration for sample data generation including:

- Time ranges and durations
- Message counts and costs
- Response time patterns
- Escalation logic parameters
- Categorization chances
- Rating distributions
- Session generation patterns

## Usage

Import thresholds in your components:

```typescript
import { ANALYTICS_THRESHOLDS } from "@/lib/config/analytics-thresholds";

// Use thresholds instead of magic numbers
if (totalSessions < ANALYTICS_THRESHOLDS.sampleSize.small) {
  // Handle small sample size
}
```

## Modifying Thresholds

All threshold values are centralized here for easy maintenance. When adjusting thresholds:

1. Consider the impact on both DataQualityIndicator and InsightsSummary components
2. Update the comments to reflect the new behavior
3. Test with various data sets to ensure appropriate triggering

## Threshold Categories

- **Sample Size**: Determines data reliability warnings
- **Time Period**: Identifies short analysis periods
- **Activity Volume**: Defines high/low activity patterns
- **Response Time**: Sets performance expectations
- **Escalation Rate**: Identifies resolution effectiveness
- **User Satisfaction**: Rating thresholds for insights
- **Categorization**: Unrecognized category warnings
- **HR Forwarding**: Escalation pattern detection
- **Sentiment Analysis**: Negative sentiment thresholds
