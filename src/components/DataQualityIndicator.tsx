/**
 * Notso AI - Data Quality Indicator Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import {
  ANALYTICS_THRESHOLDS,
  type ImpactLevel,
  type IssueType
} from "@/lib/config/analytics-thresholds";
import type { Metrics } from "@/lib/types/session";

interface DataQualityIndicatorProps {
  metrics: Metrics;
  totalSessions: number;
  totalDatasetSessions?: number;
  dateRange: { start: Date; end: Date };
  chartData?: {
    category_labels?: string[];
    category_values?: number[];
    resolution_labels?: string[];
    resolution_values?: number[];
    avg_rating?: number | null;
  };
}

interface QualityIssue {
  type: IssueType;
  title: string;
  description: string;
  impact: ImpactLevel;
}

/**
 * Analyzes session metrics and optional chart data to assess and display data quality issues.
 *
 * Evaluates the provided session metrics, total sessions, date range, and optional chart data for potential data quality concerns such as small sample size, short time period, low activity, slow response times, suspicious escalation rates, high unrecognized categories, HR forwarding anomalies, and unusual rating values. Displays a summary of detected issues with severity and impact, or indicates good data quality if no issues are found. Renders nothing if no significant issues are present.
 *
 * @returns A React component displaying data quality issues and summary, or `null` if no significant issues are detected.
 */
export function DataQualityIndicator({
  metrics,
  totalSessions,
  totalDatasetSessions,
  dateRange,
  chartData
}: DataQualityIndicatorProps) {
  const issues: QualityIssue[] = [];

  // Use total dataset sessions for quality assessment, fallback to filtered sessions
  const datasetSize = totalDatasetSessions ?? totalSessions;

  // Sample size analysis based on total dataset
  if (datasetSize < ANALYTICS_THRESHOLDS.sampleSize.verySmall) {
    issues.push({
      type: "error",
      title: "Very Small Sample Size",
      description: `Only ${datasetSize} conversations available in total dataset. Results may not be statistically significant.`,
      impact: "high"
    });
  } else if (datasetSize < ANALYTICS_THRESHOLDS.sampleSize.small) {
    issues.push({
      type: "warning",
      title: "Small Sample Size",
      description: `${datasetSize} conversations in total dataset may limit insight reliability. Consider larger datasets.`,
      impact: "medium"
    });
  }

  // Time range analysis
  const daysDiff = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgPerDay = totalSessions / Math.max(daysDiff, 1);

  if (daysDiff < ANALYTICS_THRESHOLDS.timePeriod.shortDays) {
    issues.push({
      type: "info",
      title: "Short Time Period",
      description: `Analysis covers only ${daysDiff} day(s). Trends may not represent typical patterns.`,
      impact: "medium"
    });
  }

  if (avgPerDay < ANALYTICS_THRESHOLDS.activity.lowPerDay) {
    issues.push({
      type: "warning",
      title: "Low Activity Volume",
      description: `Average of ${avgPerDay.toFixed(1)} conversations per day suggests low usage.`,
      impact: "low"
    });
  }

  // Response time quality
  const avgResponseTime = metrics["Avg. Response Time (sec)"];
  if (avgResponseTime > ANALYTICS_THRESHOLDS.responseTime.slow) {
    issues.push({
      type: "warning",
      title: "Slow Response Times",
      description: `Average response time of ${avgResponseTime.toFixed(1)}s may impact user experience.`,
      impact: "medium"
    });
  }

  // Resolution rate quality - moved to Key Insights
  // Keep only suspicious values check here
  const resolvedPercentage = metrics["Resolved Chats (%)"];
  const escalationRate = 100 - resolvedPercentage;

  // Check for suspicious 0% or 100% values
  if (escalationRate === ANALYTICS_THRESHOLDS.escalation.suspiciousZero) {
    issues.push({
      type: "warning",
      title: "Suspicious Zero Escalation Rate",
      description: "0% escalation rate may indicate missing or incorrect data tracking.",
      impact: "medium"
    });
  } else if (escalationRate === ANALYTICS_THRESHOLDS.escalation.suspicious100) {
    issues.push({
      type: "warning",
      title: "Suspicious 100% Escalation Rate",
      description: "100% escalation rate may indicate system configuration issues.",
      impact: "high"
    });
  }

  // Check for high unrecognized categories
  if (chartData?.category_labels && chartData?.category_values) {
    const totalCategorySessions = chartData.category_values.reduce((sum, val) => sum + val, 0);
    const unrecognizedIndex = chartData.category_labels.findIndex(
      (label) => label === "Unrecognized / Other"
    );

    if (unrecognizedIndex !== -1 && totalCategorySessions > 0) {
      const unrecognizedPercentage =
        (chartData.category_values[unrecognizedIndex] / totalCategorySessions) * 100;

      if (unrecognizedPercentage > ANALYTICS_THRESHOLDS.categorization.highUnrecognized) {
        issues.push({
          type: "warning",
          title: "High Unrecognized Categories",
          description: `${unrecognizedPercentage.toFixed(1)}% of conversations lack proper categorization. Consider reviewing classification rules.`,
          impact: "medium"
        });
      }
    }
  }

  // Check for HR forwarding suspicious values
  if (chartData?.resolution_labels && chartData?.resolution_values) {
    const forwardedHRIndex = chartData.resolution_labels.indexOf("Forwarded to HR");

    if (forwardedHRIndex !== -1) {
      const forwardedHRCount = chartData.resolution_values[forwardedHRIndex];
      const totalConversations = metrics["Total Conversations"];

      if (forwardedHRCount === totalConversations && totalConversations > 0) {
        issues.push({
          type: "warning",
          title: "All Conversations Forwarded to HR",
          description: "100% HR forwarding rate suggests potential configuration issues.",
          impact: "high"
        });
      } else if (
        forwardedHRCount === 0 &&
        totalConversations > ANALYTICS_THRESHOLDS.hrForwarding.minSessionsForZeroCheck
      ) {
        issues.push({
          type: "info",
          title: "No HR Escalations",
          description:
            "Zero HR escalations across all conversations - verify if HR forwarding is properly configured.",
          impact: "low"
        });
      }
    }
  }

  // Check for suspicious rating values
  if (chartData?.avg_rating !== undefined && chartData.avg_rating !== null) {
    if (
      chartData.avg_rating === ANALYTICS_THRESHOLDS.rating.perfectScore &&
      totalSessions > ANALYTICS_THRESHOLDS.rating.minSessionsForPerfectCheck
    ) {
      issues.push({
        type: "info",
        title: "Perfect Rating Score",
        description:
          "5.0/5.0 rating across all sessions - verify rating collection is working correctly.",
        impact: "low"
      });
    } else if (
      chartData.avg_rating === ANALYTICS_THRESHOLDS.rating.zeroScore &&
      totalSessions > ANALYTICS_THRESHOLDS.rating.minSessionsForZeroCheck
    ) {
      issues.push({
        type: "warning",
        title: "Zero Rating Score",
        description: "0.0 average rating may indicate rating data is not being collected.",
        impact: "medium"
      });
    }
  }

  // No issues case
  if (issues.length === 0) {
    issues.push({
      type: "info",
      title: "Good Data Quality",
      description: "Dataset appears sufficient for reliable analysis and insights.",
      impact: "low"
    });
  }

  const getIssueIcon = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return <AlertTriangle size={16} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={16} className="text-amber-500" />;
      case "info":
        return issues.length === 1 ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <Info size={16} className="text-blue-500" />
        );
    }
  };

  const getIssueColors = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "warning":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
      case "info":
        return issues.length === 1
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
          : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  const getTextColors = (type: QualityIssue["type"]) => {
    switch (type) {
      case "error":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-amber-800 dark:text-amber-200";
      case "info":
        return issues.length === 1
          ? "text-green-800 dark:text-green-200"
          : "text-blue-800 dark:text-blue-200";
    }
  };

  const getImpactBadge = (impact: QualityIssue["impact"]) => {
    const colors = {
      high: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      medium: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      low: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[impact]}`}>{impact} impact</span>
    );
  };

  // Only show if there are significant issues or if dataset size is very small
  const shouldShow = issues.some(
    (issue) =>
      issue.type === "error" ||
      (issue.type === "warning" && issue.impact === "high") ||
      datasetSize < ANALYTICS_THRESHOLDS.qualityDisplay.alwaysShowBelowSessions
  );

  if (!shouldShow) {
    return null;
  }

  return (
    <section className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Info size={24} className="text-muted-foreground" />
        Data Quality Assessment
      </h2>

      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div
            key={`${issue.type}-${issue.title}-${index}`}
            className={`border rounded-lg p-4 ${getIssueColors(issue.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIssueIcon(issue.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-semibold ${getTextColors(issue.type)}`}>{issue.title}</h3>
                  {getImpactBadge(issue.impact)}
                </div>
                <p className="text-sm text-muted-foreground">{issue.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <strong>Data Summary:</strong> {totalSessions} conversations across {daysDiff} day(s) (
        {avgPerDay.toFixed(1)} per day average)
      </div>
    </section>
  );
}
