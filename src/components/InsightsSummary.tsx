/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
import { ANALYTICS_THRESHOLDS } from "@/lib/config/analytics-thresholds";
import type { ChartData, Metrics } from "@/lib/types/session";
import { cn } from "@/lib/utils";

interface InsightsSummaryProps {
  metrics: Metrics;
  chartData: ChartData;
  dateRange: { start: Date; end: Date };
}

interface Insight {
  type: "positive" | "negative" | "warning" | "neutral";
  title: string;
  description: string;
  value?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/**
 * Displays paginated, data-driven insights summarizing chatbot conversation performance for a given date range.
 *
 * Generates and presents key insights based on provided metrics and analytics, including activity volume, user satisfaction, resolution rate, response time, sentiment, and data quality. Insights are categorized by type (positive, negative, warning) and visually styled with icons and colors. Supports pagination when multiple insights are available.
 *
 * Returns `null` if no insights are generated from the input data.
 */
export function InsightsSummary({ metrics, chartData, dateRange }: InsightsSummaryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const insightsPerPage = 2;
  const insights: Insight[] = [];

  // Calculate session volume insight
  const totalSessions = metrics["Total Conversations"];
  const daysDiff = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const avgSessionsPerDay = totalSessions / Math.max(daysDiff, 1);

  if (avgSessionsPerDay > ANALYTICS_THRESHOLDS.activity.highPerDay) {
    insights.push({
      type: "positive",
      title: "High Activity Volume",
      description: `Strong engagement with ${avgSessionsPerDay.toFixed(0)} sessions per day on average`,
      value: `${totalSessions} total sessions`,
      icon: TrendingUp
    });
  } else if (avgSessionsPerDay < ANALYTICS_THRESHOLDS.activity.lowPerDayInsight) {
    insights.push({
      type: "warning",
      title: "Low Activity Volume",
      description: `Consider promoting your chatbot - only ${avgSessionsPerDay.toFixed(0)} sessions per day`,
      value: `${totalSessions} total sessions`,
      icon: TrendingDown
    });
  }

  // User satisfaction insight
  if (chartData.avg_rating) {
    if (chartData.avg_rating >= ANALYTICS_THRESHOLDS.rating.excellent) {
      insights.push({
        type: "positive",
        title: "Excellent User Satisfaction",
        description: "Users are highly satisfied with the chatbot experience",
        value: `${chartData.avg_rating.toFixed(1)}/5.0 stars`,
        icon: CheckCircle
      });
    } else if (chartData.avg_rating < ANALYTICS_THRESHOLDS.rating.needsAttention) {
      insights.push({
        type: "negative",
        title: "User Satisfaction Needs Attention",
        description: "Consider reviewing negative feedback and improving responses",
        value: `${chartData.avg_rating.toFixed(1)}/5.0 stars`,
        icon: AlertTriangle
      });
    }
  }

  // Resolution rate insight - calculate from resolved percentage
  const resolvedPercentage = metrics["Resolved Chats (%)"];
  const escalationRate = 100 - resolvedPercentage;

  if (escalationRate > ANALYTICS_THRESHOLDS.escalation.high) {
    insights.push({
      type: "warning",
      title: "High Escalation Rate",
      description: "Many conversations require human intervention",
      value: `${escalationRate.toFixed(1)}% escalated`,
      icon: AlertTriangle
    });
  } else if (escalationRate < ANALYTICS_THRESHOLDS.escalation.low) {
    insights.push({
      type: "positive",
      title: "Effective Self-Service",
      description: "Most conversations are resolved without escalation",
      value: `${escalationRate.toFixed(1)}% escalated`,
      icon: CheckCircle
    });
  }

  // Response time insight
  const avgResponseTime = metrics["Avg. Response Time (sec)"];
  if (avgResponseTime > ANALYTICS_THRESHOLDS.responseTime.slowInsight) {
    insights.push({
      type: "warning",
      title: "Slow Response Times",
      description: "Users may experience delays - consider optimization",
      value: `${avgResponseTime.toFixed(1)}s average`,
      icon: TrendingDown
    });
  } else if (avgResponseTime < ANALYTICS_THRESHOLDS.responseTime.fast) {
    insights.push({
      type: "positive",
      title: "Fast Response Times",
      description: "Users receive quick responses for better experience",
      value: `${avgResponseTime.toFixed(1)}s average`,
      icon: TrendingUp
    });
  }

  // Sentiment analysis insight
  if (chartData.sentiment_labels && chartData.sentiment_values) {
    const totalSentimentSessions = chartData.sentiment_values.reduce((sum, val) => sum + val, 0);
    const negativeIndex = chartData.sentiment_labels.findIndex((label) =>
      label.toLowerCase().includes("negative")
    );

    if (negativeIndex !== -1 && totalSentimentSessions > 0) {
      const negativePercentage =
        (chartData.sentiment_values[negativeIndex] / totalSentimentSessions) * 100;

      if (negativePercentage > ANALYTICS_THRESHOLDS.sentiment.highNegative) {
        insights.push({
          type: "negative",
          title: "High Negative Sentiment",
          description: "Significant portion of conversations have negative sentiment",
          value: `${negativePercentage.toFixed(1)}% negative`,
          icon: TrendingDown
        });
      }
    }
  }

  // Removed category quality insight - this belongs in Data Quality Assessment

  // Data quality insight
  if (totalSessions < ANALYTICS_THRESHOLDS.sampleSize.minForInsights) {
    insights.push({
      type: "warning",
      title: "Limited Data Sample",
      description: "Insights may be less reliable with small data sets",
      value: `${totalSessions} sessions`,
      icon: AlertTriangle
    });
  }

  const getInsightColor = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
      case "negative":
        return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
      case "warning":
        return "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950";
      default:
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950";
    }
  };

  const getTextColor = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return "text-green-800 dark:text-green-200";
      case "negative":
        return "text-red-800 dark:text-red-200";
      case "warning":
        return "text-amber-800 dark:text-amber-200";
      default:
        return "text-blue-800 dark:text-blue-200";
    }
  };

  const getIconColor = (type: Insight["type"]) => {
    switch (type) {
      case "positive":
        return "text-green-600 dark:text-green-400";
      case "negative":
        return "text-red-600 dark:text-red-400";
      case "warning":
        return "text-amber-600 dark:text-amber-400";
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  if (insights.length === 0) {
    return null;
  }

  // Calculate pagination
  const totalPages = Math.ceil(insights.length / insightsPerPage);
  const startIndex = (currentPage - 1) * insightsPerPage;
  const endIndex = startIndex + insightsPerPage;
  const currentInsights = insights.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <section className="bg-card rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <CheckCircle className="h-6 w-6 text-primary" />
        Key Insights
        {totalPages > 1 && (
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {currentInsights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={`${insight.type}-${insight.title}-${startIndex + index}`}
              className={`border rounded-lg p-4 transition-all hover:shadow-md ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 flex-shrink-0 h-5 w-5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 ${getTextColor(insight.type)}`}>
                    {insight.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  {insight.value && (
                    <div className={`text-sm font-medium ${getTextColor(insight.type)}`}>
                      {insight.value}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={handlePreviousPage}
                className={cn(
                  "cursor-pointer",
                  currentPage === 1 && "pointer-events-none opacity-50"
                )}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={handleNextPage}
                className={cn(
                  "cursor-pointer",
                  currentPage === totalPages && "pointer-events-none opacity-50"
                )}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </section>
  );
}
