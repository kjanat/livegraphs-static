/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { InsightsSummary } from "@/components/InsightsSummary";
import Logo from "@/components/Logo";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { MobileDatabaseStats } from "@/components/mobile/MobileDatabaseStats";
import { MobileDateRangePicker } from "@/components/mobile/MobileDateRangePicker";
import { MobileUploadSection } from "@/components/mobile/MobileUploadSection";
import { ChartsDashboard } from "@/components/sections/ChartsDashboard";
import { DatabaseStatsSection } from "@/components/sections/DatabaseStatsSection";
import { UploadSection } from "@/components/sections/UploadSection";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";
import { EnhancedMetricsDisplay } from "@/components/ui/MetricTooltip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useDatabase } from "@/hooks/useDatabase";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { RESPONSIVE_PADDING, UI_DIMENSIONS } from "@/lib/constants/ui";
import { useDatabaseOperations } from "@/lib/hooks/useDatabaseOperations";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";

export default function Home() {
  useKeyboardNavigation();

  const isMobile = useIsMobile();
  const { isInitialized, error: dbError, loadSessionsFromJSON } = useDatabase();

  // Database operations
  const {
    dbStats,
    dateRange,
    metrics,
    chartData,
    isLoadingData,
    loadDataForDateRange,
    clearAllData,
    loadSampleData,
    exportCurrentData,
    refreshStats
  } = useDatabaseOperations();

  // File upload handling
  const {
    isUploading,
    uploadError,
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    triggerFileInput
  } = useFileUpload(loadSessionsFromJSON, {
    onSuccess: refreshStats
  });

  // Computed values
  const hasData = (dbStats?.totalSessions ?? 0) > 0;
  const hasDateRange = !!dateRange;

  // Responsive styles using constants
  const responsivePadding = {
    paddingLeft: `max(env(safe-area-inset-left, ${RESPONSIVE_PADDING.mobile.x}), ${RESPONSIVE_PADDING.mobile.x})`,
    paddingRight: `max(env(safe-area-inset-right, ${RESPONSIVE_PADDING.mobile.x}), ${RESPONSIVE_PADDING.mobile.x})`,
    paddingTop: `max(env(safe-area-inset-top, ${RESPONSIVE_PADDING.mobile.y}), ${RESPONSIVE_PADDING.mobile.y})`,
    paddingBottom: `max(env(safe-area-inset-bottom, ${RESPONSIVE_PADDING.mobile.y}), ${RESPONSIVE_PADDING.mobile.y})`
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 overflow-x-hidden"
      style={responsivePadding}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-row items-center justify-between gap-2 sm:gap-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-4">
            <Logo size={UI_DIMENSIONS.logoSize} className="text-primary flex-shrink-0" />
            <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl font-bold">Notso AI Dashboard</h1>
          </div>
          <ThemeToggle />
        </header>

        {/* Database Status Messages */}
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

        {/* Main Content */}
        {isInitialized && (
          <>
            {/* Upload Section */}
            {isMobile ? (
              <MobileUploadSection
                isUploading={isUploading}
                uploadError={uploadError}
                hasData={hasData}
                hasDateRange={hasDateRange}
                onFileUpload={handleFileUpload}
                onClearDatabase={clearAllData}
                onExportCSV={exportCurrentData}
                isDragging={isDragging}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            ) : (
              <UploadSection
                isUploading={isUploading}
                uploadError={uploadError}
                isDragging={isDragging}
                hasData={hasData}
                hasDateRange={hasDateRange}
                onFileUpload={handleFileUpload}
                onClearDatabase={clearAllData}
                onExportCSV={exportCurrentData}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              />
            )}

            {/* Database Stats */}
            {dbStats &&
              hasData &&
              (isMobile ? (
                <MobileDatabaseStats
                  totalSessions={dbStats.totalSessions}
                  dateRange={dbStats.dateRange}
                />
              ) : (
                <DatabaseStatsSection
                  totalSessions={dbStats.totalSessions}
                  dateRange={dbStats.dateRange}
                />
              ))}

            {/* Date Range Picker */}
            {dbStats &&
              hasData &&
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

            {/* Loading State */}
            {isLoadingData && dateRange && (
              <EnhancedLoadingState
                stage={isMobile ? "charts" : "metrics"}
                totalSessions={dbStats?.totalSessions}
                className="mb-8"
              />
            )}

            {/* Metrics Display (Desktop only) */}
            {!isMobile && metrics && !isLoadingData && (
              <EnhancedMetricsDisplay
                metrics={metrics as unknown as { [key: string]: string | number }}
              />
            )}

            {/* Mobile Dashboard */}
            {isMobile && metrics && chartData && !isLoadingData && (
              <MobileDashboard metrics={metrics} chartData={chartData} />
            )}

            {/* Desktop Dashboard */}
            {!isMobile && metrics && chartData && dateRange && !isLoadingData && (
              <>
                <DataQualityIndicator
                  metrics={metrics}
                  totalSessions={metrics["Total Conversations"]}
                  dateRange={dateRange}
                />

                <InsightsSummary metrics={metrics} chartData={chartData} dateRange={dateRange} />

                <ChartsDashboard metrics={metrics} chartData={chartData} />
              </>
            )}

            {/* Empty State */}
            {!hasData && (
              <section
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={isDragging ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}
                aria-label="Drop zone for JSON files"
              >
                <EmptyState onSampleData={loadSampleData} onUploadClick={triggerFileInput} />
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
