/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CostAnalysisChart } from "@/components/charts/CostAnalysisChart";
import { DailyCostTrendChart } from "@/components/charts/DailyCostTrendChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { HistogramChart } from "@/components/charts/HistogramChart";
import { InteractiveHeatmap } from "@/components/charts/InteractiveHeatmap";
import { LanguageDistributionChart } from "@/components/charts/LanguageDistributionChart";
import { PerformanceTrendsChart } from "@/components/charts/PerformanceTrendsChart";
import { ResolutionStatusChart } from "@/components/charts/ResolutionStatusChart";
import { SentimentDistributionChart } from "@/components/charts/SentimentDistributionChart";
import { SessionsByCountryChart } from "@/components/charts/SessionsByCountryChart";
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart";
import { TopQuestionsSection } from "@/components/charts/TopQuestionsSection";
import { DownloadIcon, SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons";
import Logo from "@/components/Logo";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { ChartSkeleton, MetricsSkeleton } from "@/components/ui/LoadingSkeleton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDatabase } from "@/hooks/useDatabase";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { calculateMetrics, exportToCSV, prepareChartData } from "@/lib/dataProcessor";
import { generateSampleData } from "@/lib/sampleData";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";
import { getChartColors } from "@/lib/utils/chartColors";
import { validateSessionData } from "@/lib/validation/schema";

export default function Home() {
  useKeyboardNavigation();

  const {
    isInitialized,
    error: dbError,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase,
    db
  } = useDatabase();
  const [dbStats, setDbStats] = useState<{
    totalSessions: number;
    dateRange: { min: string; max: string };
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isInitialized && !dbError) {
      const stats = getDatabaseStats();
      setDbStats(stats);
    }
  }, [isInitialized, dbError, getDatabaseStats]);

  const loadDataForDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!db) return;

      setIsLoadingData(true);
      try {
        const range: DateRange = { start: startDate, end: endDate };
        setDateRange(range);

        // Calculate metrics and prepare chart data
        const newMetrics = await calculateMetrics(db, range);
        const newChartData = await prepareChartData(db, range);

        setMetrics(newMetrics);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingData(false);
      }
    },
    [db]
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate the data
      const validatedData = validateSessionData(jsonData);

      // Load into database
      const count = await loadSessionsFromJSON(validatedData);

      // Update stats
      const stats = getDatabaseStats();
      setDbStats(stats);

      // Clear existing data views to force reload
      setMetrics(null);
      setChartData(null);
      setDateRange(null);

      toast.success(`Successfully loaded ${count} sessions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load file";
      setUploadError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = "";
    }
  };

  const handleClearDatabase = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      clearDatabase();
      setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
      setMetrics(null);
      setChartData(null);
      setDateRange(null);
    }
  };

  const handleExportCSV = () => {
    if (!db || !dateRange) return;

    const csv = exportToCSV(db, dateRange);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livegraphs_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = async () => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const sampleData = generateSampleData();
      const count = await loadSessionsFromJSON(sampleData);

      const stats = getDatabaseStats();
      setDbStats(stats);

      setMetrics(null);
      setChartData(null);
      setDateRange(null);

      toast.success(`Successfully loaded ${count} sample sessions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load sample data";
      setUploadError(errorMessage);
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Logo size={48} className="text-primary" />
            <h1 className="text-4xl font-bold">Notso AI Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Database Status */}
        {!isInitialized && !dbError && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-8">
            <p className="text-primary">Initializing database...</p>
          </div>
        )}

        {dbError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-8">
            <p className="text-destructive">Database error: {dbError}</p>
          </div>
        )}

        {/* Upload Section */}
        {isInitialized && (
          <section
            id="upload-section"
            className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg"
            aria-label="Data upload section"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Upload Data</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label
                className={`bg-primary text-primary-foreground font-medium py-2 px-4 rounded transition-colors flex items-center gap-2 ${
                  isUploading
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:bg-primary/90 cursor-pointer"
                }`}
              >
                <UploadIcon size={18} />
                Upload File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                  aria-label="Upload JSON file"
                />
              </label>
              {isUploading && (
                <span className="text-muted-foreground flex items-center gap-2">
                  <SpinnerIcon size={16} />
                  Processing...
                </span>
              )}
              {dbStats && dbStats.totalSessions > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleClearDatabase}
                    className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2 px-4 rounded transition-colors flex items-center gap-2"
                    aria-label="Clear all data from database"
                  >
                    <TrashIcon size={18} />
                    Clear Database
                  </button>
                  {dateRange && (
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors flex items-center gap-2"
                      aria-label="Export data as CSV file"
                    >
                      <DownloadIcon size={18} />
                      Export CSV
                    </button>
                  )}
                </>
              )}
            </div>
            {uploadError && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
                {uploadError}
              </div>
            )}
          </section>
        )}

        {/* Database Stats */}
        {dbStats && isInitialized && dbStats.totalSessions > 0 && (
          <section
            className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg"
            aria-label="Database statistics"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Database Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded transition-colors hover:bg-primary/15">
                <div className="text-sm text-muted-foreground">Total Sessions</div>
                <div className="text-2xl font-bold text-primary">{dbStats.totalSessions}</div>
              </div>
              <div className="bg-green-600/10 p-4 rounded transition-colors hover:bg-green-600/15">
                <div className="text-sm text-muted-foreground">Data Start Date</div>
                <div className="text-lg font-semibold text-green-600">
                  {dbStats.dateRange.min
                    ? new Date(dbStats.dateRange.min).toLocaleDateString()
                    : "No data"}
                </div>
              </div>
              <div className="bg-purple-600/10 p-4 rounded transition-colors hover:bg-purple-600/15">
                <div className="text-sm text-muted-foreground">Data End Date</div>
                <div className="text-lg font-semibold text-purple-600">
                  {dbStats.dateRange.max
                    ? new Date(dbStats.dateRange.max).toLocaleDateString()
                    : "No data"}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Date Range Picker */}
        {dbStats && dbStats.totalSessions > 0 && (
          <DateRangePicker
            minDate={dbStats.dateRange.min}
            maxDate={dbStats.dateRange.max}
            onDateRangeChange={loadDataForDateRange}
          />
        )}

        {/* Metrics */}
        {isLoadingData && dateRange && <MetricsSkeleton />}
        {metrics && !isLoadingData && (
          <div className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg animate-in">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(metrics).map(([key, value], index) => (
                <div
                  key={key}
                  className="bg-secondary p-4 rounded transition-all hover:bg-secondary/80 hover:scale-105"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="text-sm text-muted-foreground">{key}</div>
                  <div className="text-xl font-semibold">
                    {typeof value === "number" ? value.toLocaleString() : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts Loading State */}
        {isLoadingData && dateRange && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <ChartSkeleton />
              <ChartSkeleton />
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>
        )}

        {/* Charts Dashboard */}
        {chartData &&
          !isLoadingData &&
          (() => {
            const colors = getChartColors();

            return (
              <section
                id="charts-section"
                className="animate-in"
                style={{ animationDelay: "200ms" }}
                aria-label="Analytics charts dashboard"
              >
                {/* Primary Insights Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  <SentimentDistributionChart
                    data={{
                      labels: chartData.sentiment_labels,
                      values: chartData.sentiment_values
                    }}
                  />
                  <ResolutionStatusChart
                    data={{
                      labels: chartData.resolution_labels,
                      values: chartData.resolution_values
                    }}
                  />
                  <GaugeChart value={chartData.avg_rating} title="Average User Rating" />
                </div>

                {/* Time Series Analysis */}
                <div className="mb-8">
                  <PerformanceTrendsChart
                    data={{
                      dates_labels: chartData.dates_labels,
                      dates_values: chartData.dates_values,
                      response_time_values: chartData.response_time_values
                    }}
                  />
                </div>

                {/* Usage Patterns */}
                <div className="mb-8">
                  <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
                </div>

                {/* Geographic & Language Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <SessionsByCountryChart
                    data={{
                      labels: chartData.country_labels,
                      values: chartData.country_values
                    }}
                  />
                  <LanguageDistributionChart
                    data={{
                      labels: chartData.language_labels,
                      values: chartData.language_values
                    }}
                  />
                </div>

                {/* Category Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <TopCategoriesChart
                    data={{
                      labels: chartData.category_labels,
                      values: chartData.category_values
                    }}
                  />
                  <CostAnalysisChart data={chartData.category_costs} />
                </div>

                {/* Performance Distributions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
                  <HistogramChart
                    data={chartData.conversation_durations}
                    title="Conversation Duration Distribution"
                    xLabel="Duration (minutes)"
                    bins={15}
                    color={colors.teal}
                  />
                  <HistogramChart
                    data={chartData.messages_per_conversation}
                    title="Messages per Conversation"
                    xLabel="Number of Messages"
                    bins={10}
                    color={colors.pink}
                  />
                </div>

                {/* Cost Analysis */}
                <div className="mb-8">
                  <DailyCostTrendChart
                    data={{
                      dates: chartData.cost_dates,
                      values: chartData.cost_values
                    }}
                  />
                </div>

                {/* Top Questions */}
                <TopQuestionsSection
                  data={{
                    labels: chartData.questions_labels,
                    values: chartData.questions_values
                  }}
                />
              </section>
            );
          })()}

        {/* Empty State */}
        {(!dbStats || dbStats.totalSessions === 0) && isInitialized && (
          <EmptyState onSampleData={handleLoadSampleData} />
        )}
      </div>
    </main>
  );
}
