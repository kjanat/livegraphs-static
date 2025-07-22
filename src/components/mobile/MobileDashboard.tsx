/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import {
  BarChart3Icon,
  MessageSquareIcon,
  TrendingUpIcon,
  UsersIcon
} from "@/components/icons/index";
import type { ChartData, Metrics } from "@/lib/types/session";
import { calculateMetricTrends } from "@/lib/utils/trendCalculator";
import { MobileCollapsibleSection } from "./MobileCollapsibleSection";
import { MobileFooter } from "./MobileFooter";
import { MobileHighlights } from "./MobileHighlights";
import { MobileMetricCard } from "./MobileMetricCard";
import { MobileProgressBar } from "./MobileProgressBar";
import { MobileTabs } from "./MobileTabs";

interface MobileDashboardProps {
  metrics: Metrics;
  chartData: ChartData;
}

export function MobileDashboard({ metrics, chartData }: MobileDashboardProps) {
  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart3Icon size={16} /> },
    { id: "performance", label: "Perf", icon: <TrendingUpIcon size={16} /> },
    { id: "users", label: "Users", icon: <UsersIcon size={16} /> },
    { id: "details", label: "Details", icon: <MessageSquareIcon size={16} /> }
  ];

  // Calculate additional metrics from chart data
  const resolvedIndex = chartData.resolution_labels.indexOf("Resolved");
  const escalatedIndex = chartData.resolution_labels.indexOf("Escalated");
  const forwardedHRIndex = chartData.resolution_labels.indexOf("Forwarded to HR");

  const resolvedCount = resolvedIndex !== -1 ? chartData.resolution_values[resolvedIndex] : 0;
  const escalatedCount = escalatedIndex !== -1 ? chartData.resolution_values[escalatedIndex] : 0;
  const forwardedHRCount =
    forwardedHRIndex !== -1 ? chartData.resolution_values[forwardedHRIndex] : 0;

  const resolutionRate =
    metrics["Total Conversations"] > 0 ? (resolvedCount / metrics["Total Conversations"]) * 100 : 0;

  const escalationRate =
    metrics["Total Conversations"] > 0
      ? (escalatedCount / metrics["Total Conversations"]) * 100
      : 0;

  const avgRating =
    typeof metrics["Avg. User Rating"] === "number" ? metrics["Avg. User Rating"] : null;

  // Calculate trends (week-over-week by default, can be changed to day-over-day)
  const trends = calculateMetricTrends(chartData, true);

  return (
    <div className="w-full">
      {/* Highlights Section */}
      <MobileHighlights metrics={metrics} />

      {/* Tab Navigation */}
      <MobileTabs tabs={tabs} defaultTab="overview">
        {(activeTab) => {
          switch (activeTab) {
            case "overview":
              return (
                <div className="space-y-4">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <MobileMetricCard
                      title="Total Conversations"
                      value={metrics["Total Conversations"]}
                      color="primary"
                      icon={<MessageSquareIcon size={20} />}
                      trend={trends.totalConversations}
                    />
                    <MobileMetricCard
                      title="Resolved"
                      value={resolvedCount}
                      subtitle={`${resolutionRate.toFixed(0)}% resolution rate`}
                      color="green"
                      icon={<BarChart3Icon size={20} />}
                    />
                    <MobileMetricCard
                      title="Avg Response Time"
                      value={`${metrics["Avg. Response Time (sec)"]}s`}
                      color="blue"
                      icon={<TrendingUpIcon size={20} />}
                      trend={trends.responseTime}
                    />
                    <MobileMetricCard
                      title="Avg Daily Cost"
                      value={`€${metrics["Average Daily Cost (€)"]}`}
                      color="purple"
                      icon={<BarChart3Icon size={20} />}
                      trend={trends.dailyCost}
                    />
                  </div>

                  {/* Sentiment Distribution */}
                  <div className="bg-card rounded-lg p-3 shadow-sm">
                    <h3 className="font-semibold text-sm mb-3">Sentiment Distribution</h3>
                    <div className="space-y-2.5">
                      {(() => {
                        const totalSentiments = chartData.sentiment_values.reduce(
                          (sum, val) => sum + val,
                          0
                        );
                        return chartData.sentiment_labels.map((label, index) => (
                          <MobileProgressBar
                            key={label}
                            label={label}
                            value={chartData.sentiment_values[index]}
                            max={totalSentiments}
                            color={
                              label.toLowerCase() === "positive"
                                ? "green"
                                : label.toLowerCase() === "negative"
                                  ? "red"
                                  : "blue"
                            }
                          />
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              );

            case "performance":
              return (
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <MobileMetricCard
                      title="Escalation Rate"
                      value={`${escalationRate.toFixed(1)}%`}
                      subtitle={`${escalatedCount} conversations`}
                      color={escalationRate > 30 ? "red" : "green"}
                    />
                    <MobileMetricCard title="HR Forwards" value={forwardedHRCount} color="orange" />
                    {avgRating !== null && (
                      <MobileMetricCard
                        title="User Rating"
                        value={avgRating.toFixed(1)}
                        subtitle="out of 5 stars"
                        color={avgRating >= 4 ? "green" : avgRating >= 3 ? "orange" : "red"}
                      />
                    )}
                    <MobileMetricCard
                      title="Peak Usage"
                      value={metrics["Peak Usage Time"]}
                      subtitle="busiest hour"
                      color="blue"
                    />
                  </div>

                  {/* Resolution Status */}
                  <div className="bg-card rounded-lg p-3 shadow-sm">
                    <h3 className="font-semibold text-sm mb-3">Resolution Status</h3>
                    <div className="space-y-2.5">
                      {chartData.resolution_labels.map((label, index) => (
                        <MobileProgressBar
                          key={label}
                          label={label}
                          value={chartData.resolution_values[index]}
                          max={metrics["Total Conversations"]}
                          color={label === "Resolved" ? "green" : "red"}
                          showPercentage={false}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );

            case "users":
              return (
                <div className="space-y-4">
                  {/* User Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <MobileMetricCard
                      title="Unique Users"
                      value={metrics["Unique Users"]}
                      icon={<UsersIcon size={20} />}
                      color="blue"
                    />
                    <MobileMetricCard
                      title="Countries"
                      value={chartData.country_labels.length}
                      color="purple"
                    />
                  </div>

                  {/* Top Countries */}
                  <MobileCollapsibleSection
                    title="Top Countries"
                    badge={chartData.country_labels.length}
                    defaultExpanded={true}
                  >
                    <div className="space-y-2.5">
                      {(() => {
                        const totalCountrySessions = chartData.country_values.reduce(
                          (sum, val) => sum + val,
                          0
                        );
                        return chartData.country_labels
                          .slice(0, 5)
                          .map((country, index) => (
                            <MobileProgressBar
                              key={country}
                              label={country}
                              value={chartData.country_values[index]}
                              max={totalCountrySessions}
                              color="blue"
                            />
                          ));
                      })()}
                    </div>
                  </MobileCollapsibleSection>

                  {/* Top Languages */}
                  <MobileCollapsibleSection
                    title="Top Languages"
                    badge={chartData.language_labels.length}
                    defaultExpanded={true}
                  >
                    <div className="space-y-2.5">
                      {(() => {
                        const totalLanguageSessions = chartData.language_values.reduce(
                          (sum, val) => sum + val,
                          0
                        );
                        return chartData.language_labels
                          .slice(0, 5)
                          .map((lang, index) => (
                            <MobileProgressBar
                              key={lang}
                              label={lang}
                              value={chartData.language_values[index]}
                              max={totalLanguageSessions}
                              color="purple"
                            />
                          ));
                      })()}
                    </div>
                  </MobileCollapsibleSection>
                </div>
              );

            case "details":
              return (
                <div className="space-y-3">
                  {/* Top Categories */}
                  <MobileCollapsibleSection
                    title="Top Categories"
                    badge={chartData.category_labels.length}
                    defaultExpanded={true}
                  >
                    <div className="space-y-2">
                      {chartData.category_labels.slice(0, 10).map((category, index) => (
                        <div key={category} className="flex justify-between items-center py-1.5">
                          <span className="text-sm truncate mr-2">{category}</span>
                          <span className="text-sm font-medium text-muted-foreground">
                            {chartData.category_values[index]}
                          </span>
                        </div>
                      ))}
                      {chartData.category_labels.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{chartData.category_labels.length - 10} more categories
                        </p>
                      )}
                    </div>
                  </MobileCollapsibleSection>

                  {/* Top Questions */}
                  <MobileCollapsibleSection
                    title="Frequent Questions"
                    badge={chartData.questions_labels.length}
                    defaultExpanded={true}
                  >
                    <div className="space-y-2">
                      {chartData.questions_labels.slice(0, 10).map((question, index) => (
                        <div key={question} className="py-1.5">
                          <p className="text-sm line-clamp-2">{question}</p>
                          <span className="text-xs text-muted-foreground">
                            Asked {chartData.questions_values[index]} times
                          </span>
                        </div>
                      ))}
                      {chartData.questions_labels.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center py-1">
                          +{chartData.questions_labels.length - 10} more questions
                        </p>
                      )}
                    </div>
                  </MobileCollapsibleSection>
                </div>
              );

            default:
              return null;
          }
        }}
      </MobileTabs>

      {/* Mobile Footer */}
      <MobileFooter />
    </div>
  );
}
