/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";
import { ClearDatabaseDialog } from "@/components/dialogs/ClearDatabaseDialog";
import { InsightsSummary } from "@/components/InsightsSummary";
import { MobileDashboard } from "@/components/mobile/MobileDashboard";
import { MobileDatabaseStats } from "@/components/mobile/MobileDatabaseStats";
import { MobileUploadSection } from "@/components/mobile/MobileUploadSection";
import { ChartsDashboard } from "@/components/sections/ChartsDashboard";
import { ChartsDashboardTabs } from "@/components/sections/ChartsDashboardTabs";
import { DatabaseStatsSection } from "@/components/sections/DatabaseStatsSection";
import { UploadSection } from "@/components/sections/UploadSection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/EmptyState";
import { EnhancedLoadingState } from "@/components/ui/EnhancedLoadingState";
import { EnhancedMetricsDisplay } from "@/components/ui/MetricTooltip";
import { useDatabase } from "@/hooks/useDatabase";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useDatabaseOperations } from "@/lib/hooks/useDatabaseOperations";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";

/**
 * Client Dashboard - contains all interactive elements
 * This is a Client Component that handles state management and user interactions
 */
export function ClientDashboard() {
  useKeyboardNavigation();

  const isMobile = useIsMobile();
  const [useTabView, setUseTabView] = useState(true);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const databaseHook = useDatabase();
  const { isInitialized, error: dbError, loadSessionsFromJSON } = databaseHook;

  // Database operations
  const {
    dbStats,
    dateRange,
    metrics,
    chartData,
    isLoadingData,
    showNoDataAlert,
    setShowNoDataAlert,
    loadDataForDateRange,
    clearAllData,
    loadSampleData,
    exportCurrentData,
    loadNewDataset
  } = useDatabaseOperations(databaseHook);

  // File upload handling
  const {
    isUploading,
    uploadError,
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  } = useFileUpload(loadSessionsFromJSON, {
    onSuccess: async () => {
      // Use atomic function to avoid race conditions
      await loadNewDataset();
    }
  });

  // Computed values
  const hasData = (dbStats?.totalSessions ?? 0) > 0;
  const hasDateRange = !!dateRange;

  // Wrapper function to show dialog instead of directly clearing
  const handleClearDatabase = () => {
    setShowClearDialog(true);
  };

  const confirmClearDatabase = () => {
    clearAllData();
    setShowClearDialog(false);
  };

  return (
    <>
      {/* Clear Database Dialog */}
      <ClearDatabaseDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={confirmClearDatabase}
      />

      {/* Command Palette */}
      <CommandPalette
        onClearDatabase={handleClearDatabase}
        onExportCSV={exportCurrentData}
        onLoadSampleData={loadSampleData}
        hasData={hasData}
      />

      {/* Database Status Messages */}
      {!isInitialized && !dbError && (
        <Alert className="mb-8">
          <AlertDescription>Initializing database...</AlertDescription>
        </Alert>
      )}

      {dbError && (
        <Alert variant="destructive" className="mb-8">
          <AlertTitle>Database Error</AlertTitle>
          <AlertDescription>{dbError.message}</AlertDescription>
        </Alert>
      )}

      {/* No Data Alert Dialog */}
      <AlertDialog open={showNoDataAlert} onOpenChange={setShowNoDataAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No data for current week</AlertDialogTitle>
            <AlertDialogDescription>
              The current working week (Monday to today) has no data. We&apos;ve loaded the most
              recent week with available data instead. You can use the date picker to select any
              date range you&apos;d like to analyze.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoDataAlert(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              onClearDatabase={handleClearDatabase}
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
              onClearDatabase={handleClearDatabase}
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
          {dbStats && hasData && (
            <DateRangePicker
              value={dateRange ? { from: dateRange.start, to: dateRange.end } : undefined}
              onChange={(range) => {
                if (range?.from && range?.to) {
                  loadDataForDateRange(range.from, range.to);
                }
              }}
              minDate={new Date(dbStats.dateRange.min)}
              maxDate={new Date(dbStats.dateRange.max)}
              presets={[
                {
                  label: "All Data",
                  shortLabel: "All",
                  value: () => {
                    const min = new Date(dbStats.dateRange.min);
                    const max = new Date(dbStats.dateRange.max);
                    return { from: min, to: max };
                  }
                },
                {
                  label: "Last 7 Days",
                  shortLabel: "7D",
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 6);
                    return { from: start, to: end };
                  }
                },
                {
                  label: "Last 30 Days",
                  shortLabel: "30D",
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 29);
                    return { from: start, to: end };
                  }
                },
                {
                  label: "Last 3 Months",
                  shortLabel: "3M",
                  value: () => {
                    const end = new Date();
                    const start = new Date();
                    start.setMonth(start.getMonth() - 3);
                    return { from: start, to: end };
                  }
                }
              ]}
              monthsMobile={1}
              monthsDesktop={2}
              showPresetCombobox={true}
            />
          )}

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
                chartData={chartData}
              />

              <InsightsSummary metrics={metrics} chartData={chartData} dateRange={dateRange} />

              {/* View Toggle */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseTabView(!useTabView)}
                  className="gap-2"
                >
                  {useTabView ? "Switch to Expandable View" : "Switch to Tab View"}
                </Button>
              </div>

              {/* Charts - Conditional rendering based on view preference */}
              {useTabView ? (
                <ChartsDashboardTabs metrics={metrics} chartData={chartData} />
              ) : (
                <ChartsDashboard metrics={metrics} chartData={chartData} />
              )}
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
              <EmptyState onSampleData={loadSampleData} onFileUpload={handleFileUpload} />
            </section>
          )}
        </>
      )}
    </>
  );
}
