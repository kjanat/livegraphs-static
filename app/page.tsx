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

import { useCallback, useEffect, useRef, useState } from "react";
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
import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { InsightsSummary } from "@/components/InsightsSummary";
import { DownloadIcon, SpinnerIcon, TrashIcon, UploadIcon } from "@/components/icons/index";
import Logo from "@/components/Logo";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { MobileDatabaseStats } from "@/components/mobile/MobileDatabaseStats";
import { MobileDateRangePicker } from "@/components/mobile/MobileDateRangePicker";
import { MobileUploadSection } from "@/components/mobile/MobileUploadSection";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { EnhancedMetricsDisplay } from "@/components/ui/MetricTooltip";
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
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dragCounter = useRef(0);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const processFile = async (file: File) => {
    if (!file || (!file.type.includes("json") && !file.name.endsWith(".json"))) {
      setUploadError("Please upload a valid JSON file");
      return;
    }

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
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await processFile(file);
    // Clear the input
    event.target.value = "";
  };

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(event.dataTransfer.files);
    const jsonFile = files.find(
      (file) => file.type === "application/json" || file.name.endsWith(".json")
    );

    if (jsonFile) {
      await processFile(jsonFile);
    } else {
      setUploadError("Please drop a valid JSON file");
    }
  };

  const handleClearDatabase = () => {
    toast.custom(
      (t) => (
        <div className="bg-card rounded-lg p-4 shadow-lg border border-border max-w-md">
          <h3 className="font-semibold text-base mb-2">Clear All Data?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will permanently delete all sessions from the database. This action cannot be
            undone.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => toast.dismiss(t)}
              className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                clearDatabase();
                setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
                setMetrics(null);
                setChartData(null);
                setDateRange(null);
                toast.dismiss(t);
                toast.success("Database cleared successfully");
              }}
              className="px-3 py-1.5 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
            >
              Clear Database
            </button>
          </div>
        </div>
      ),
      {
        duration: 60000, // 1 minute timeout
        position: "top-center"
      }
    );
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

  const handleTriggerFileUpload = () => {
    // Try to find any visible file input (works for both mobile and desktop)
    const fileInputs = document.querySelectorAll('input[type="file"][accept=".json"]');
    for (const input of fileInputs) {
      const element = input as HTMLInputElement;
      // Check if the input is not disabled and is in the DOM
      if (!element.disabled && element.offsetParent !== null) {
        element.click();
        break;
      }
    }
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
    <main
      id="main-content"
      className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 overflow-x-hidden"
      style={{
        paddingLeft: "max(env(safe-area-inset-left, 1rem), 1rem)",
        paddingRight: "max(env(safe-area-inset-right, 1rem), 1rem)",
        paddingTop: "max(env(safe-area-inset-top, 1.5rem), 1.5rem)",
        paddingBottom: "max(env(safe-area-inset-bottom, 1.5rem), 1.5rem)"
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Logo size={48} className="text-primary flex-shrink-0" />
            <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold">Notso AI Dashboard</h1>
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
        {isInitialized &&
          (isMobile ? (
            <MobileUploadSection
              isUploading={isUploading}
              uploadError={uploadError}
              hasData={(dbStats?.totalSessions ?? 0) > 0}
              hasDateRange={!!dateRange}
              onFileUpload={handleFileUpload}
              onClearDatabase={handleClearDatabase}
              onExportCSV={handleExportCSV}
              isDragging={isDragging}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            />
          ) : (
            <section
              id="upload-section"
              className={`bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg ${
                isDragging ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
              }`}
              aria-label="Data upload section"
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <h2 className="text-[1.25rem] sm:text-2xl font-bold mb-4">
                {dbStats && dbStats.totalSessions > 0 ? "Manage Data" : "Upload Data"}
              </h2>
              {isDragging && (
                <div className="mb-4 p-4 border-2 border-dashed border-primary rounded-lg bg-primary/10 text-center">
                  <p className="text-lg font-medium text-primary">Drop your JSON file here</p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label
                  className={`bg-primary text-primary-foreground font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[44px] ${
                    isUploading
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : "hover:bg-primary/90 cursor-pointer"
                  }`}
                >
                  <UploadIcon size={18} />
                  {dbStats && dbStats.totalSessions > 0 ? "Upload New File" : "Upload File"}
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
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[44px]"
                      aria-label="Clear all data from database"
                    >
                      <TrashIcon size={18} />
                      Clear Database
                    </button>
                    {dateRange && (
                      <button
                        type="button"
                        onClick={handleExportCSV}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[44px]"
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
          ))}

        {/* Database Stats */}
        {dbStats &&
          isInitialized &&
          dbStats.totalSessions > 0 &&
          (isMobile ? (
            <MobileDatabaseStats
              totalSessions={dbStats.totalSessions}
              dateRange={dbStats.dateRange}
            />
          ) : (
            <section
              className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg"
              aria-label="Database statistics"
            >
              <h2 className="text-[1.25rem] sm:text-2xl font-bold mb-4">Database Statistics</h2>
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
          ))}

        {/* Date Range Picker */}
        {dbStats &&
          dbStats.totalSessions > 0 &&
          (isMobile ? (
            <MobileDateRangePicker
              minDate={dbStats.dateRange.min}
              maxDate={dbStats.dateRange.max}
              onDateRangeChange={loadDataForDateRange}
            />
          ) : (
            <DateRangePicker
              minDate={dbStats.dateRange.min}
              maxDate={dbStats.dateRange.max}
              onDateRangeChange={loadDataForDateRange}
            />
          ))}

        {/* Metrics - Desktop only */}
        {!isMobile && isLoadingData && dateRange && (
          <EnhancedLoadingState
            stage="metrics"
            totalSessions={dbStats?.totalSessions}
            className="mb-8"
          />
        )}
        {!isMobile && metrics && !isLoadingData && (
          <EnhancedMetricsDisplay
            metrics={metrics as unknown as { [key: string]: string | number }}
          />
        )}

        {/* Charts Loading State */}
        {isLoadingData && dateRange && (
          <EnhancedLoadingState
            stage="charts"
            totalSessions={dbStats?.totalSessions}
            className="mb-8"
          />
        )}

        {/* Mobile Dashboard */}
        {isMobile && metrics && chartData && !isLoadingData && (
          <MobileDashboard metrics={metrics} chartData={chartData} />
        )}

        {/* Desktop-only components */}
        {!isMobile && (
          <>
            {/* Data Quality Assessment */}
            {metrics && chartData && dateRange && !isLoadingData && (
              <DataQualityIndicator
                metrics={metrics}
                totalSessions={metrics["Total Conversations"]}
                dateRange={dateRange}
              />
            )}

            {/* Key Insights Summary */}
            {metrics && chartData && dateRange && !isLoadingData && (
              <InsightsSummary metrics={metrics} chartData={chartData} dateRange={dateRange} />
            )}
          </>
        )}

        {/* Progressive Charts Dashboard - Desktop only */}
        {!isMobile &&
          chartData &&
          !isLoadingData &&
          (() => {
            const colors = getChartColors();
            const totalSessions = metrics?.["Total Conversations"] || 0;

            // Smart visibility logic
            const hasRatings = chartData.avg_rating && chartData.avg_rating > 0;
            const hasCountryData = chartData.country_labels && chartData.country_labels.length > 1;
            const hasLanguageData =
              chartData.language_labels && chartData.language_labels.length > 1;
            const hasSufficientData = totalSessions >= 10;

            return (
              <div className="space-y-6">
                {/* Essential Overview - Always visible */}
                <ExpandableSection
                  title="Essential Overview"
                  subtitle="Key performance indicators and user satisfaction"
                  defaultExpanded={true}
                  priority="high"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    {hasRatings && (
                      <GaugeChart value={chartData.avg_rating} title="Average User Rating" />
                    )}
                  </div>
                </ExpandableSection>

                {/* Performance Trends - Expanded by default if sufficient data */}
                <ExpandableSection
                  title="Performance Trends"
                  subtitle="Response times and activity patterns over time"
                  defaultExpanded={hasSufficientData}
                  priority="high"
                >
                  <div className="space-y-6">
                    <PerformanceTrendsChart
                      data={{
                        dates_labels: chartData.dates_labels,
                        dates_values: chartData.dates_values,
                        response_time_values: chartData.response_time_values
                      }}
                    />
                    <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
                  </div>
                </ExpandableSection>

                {/* Geographic & Language Analysis - Only show if diverse data */}
                {(hasCountryData || hasLanguageData) && (
                  <ExpandableSection
                    title="Geographic & Language Analysis"
                    subtitle="User distribution across regions and languages"
                    defaultExpanded={false}
                    priority="medium"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {hasCountryData && (
                        <SessionsByCountryChart
                          data={{
                            labels: chartData.country_labels,
                            values: chartData.country_values
                          }}
                        />
                      )}
                      {hasLanguageData && (
                        <LanguageDistributionChart
                          data={{
                            labels: chartData.language_labels,
                            values: chartData.language_values
                          }}
                        />
                      )}
                    </div>
                  </ExpandableSection>
                )}

                {/* Category & Cost Analysis */}
                <ExpandableSection
                  title="Category & Cost Analysis"
                  subtitle="Conversation topics and operational costs"
                  defaultExpanded={false}
                  priority="medium"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <TopCategoriesChart
                        data={{
                          labels: chartData.category_labels,
                          values: chartData.category_values
                        }}
                      />
                      <CostAnalysisChart data={chartData.category_costs} />
                    </div>
                    <DailyCostTrendChart
                      data={{
                        dates: chartData.cost_dates,
                        values: chartData.cost_values
                      }}
                    />
                  </div>
                </ExpandableSection>

                {/* Detailed Statistics - Advanced users only */}
                <ExpandableSection
                  title="Detailed Statistics"
                  subtitle="Distribution analysis and conversation patterns"
                  defaultExpanded={false}
                  priority="low"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
                    <TopQuestionsSection
                      data={{
                        labels: chartData.questions_labels,
                        values: chartData.questions_values
                      }}
                    />
                  </div>
                </ExpandableSection>
              </div>
            );
          })()}

        {/* Empty State */}
        {(!dbStats || dbStats.totalSessions === 0) && isInitialized && (
          <section
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`${isDragging ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}`}
            aria-label="Drop zone for JSON files"
          >
            <EmptyState
              onSampleData={handleLoadSampleData}
              onUploadClick={handleTriggerFileUpload}
            />
          </section>
        )}
      </div>
    </main>
  );
}
