/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";
import { CommandPalette } from "@/components/CommandPalette";
import { AlertManager } from "@/components/dashboard/AlertManager";
import { DatabaseStateManager } from "@/components/dashboard/DatabaseStateManager";
import { DataVisualization } from "@/components/dashboard/DataVisualization";
import { FileUploadManager } from "@/components/dashboard/FileUploadManager";
import { MobileDatabaseStats } from "@/components/mobile/MobileDatabaseStats";
import { DatabaseStatsSection } from "@/components/sections/DatabaseStatsSection";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDatabase } from "@/hooks/useDatabase";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useDatabaseOperations } from "@/lib/hooks/useDatabaseOperations";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";

/**
 * Client Dashboard - Refactored version with better separation of concerns
 * This is a Client Component that handles state management and user interactions
 */
export function ClientDashboard() {
  useKeyboardNavigation();

  const isMobile = useIsMobile();
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
    onSuccess: loadNewDataset
  });

  // Computed values
  const hasData = (dbStats?.totalSessions ?? 0) > 0;
  const hasDateRange = !!dateRange;

  // Handlers
  const handleClearDatabase = () => setShowClearDialog(true);
  const confirmClearDatabase = () => {
    clearAllData();
    setShowClearDialog(false);
  };

  return (
    <>
      {/* Alert Management */}
      <AlertManager
        showClearDialog={showClearDialog}
        setShowClearDialog={setShowClearDialog}
        showNoDataAlert={showNoDataAlert}
        setShowNoDataAlert={setShowNoDataAlert}
        onClearConfirm={confirmClearDatabase}
      />

      {/* Command Palette */}
      <CommandPalette
        onClearDatabase={handleClearDatabase}
        onExportCSV={exportCurrentData}
        onLoadSampleData={loadSampleData}
        hasData={hasData}
      />

      {/* Database State */}
      <DatabaseStateManager isInitialized={isInitialized} error={dbError} />

      {/* Main Content */}
      {isInitialized && (
        <>
          {/* File Upload Section */}
          <FileUploadManager
            hasData={hasData}
            hasDateRange={hasDateRange}
            isUploading={isUploading}
            uploadError={uploadError}
            onFileUpload={loadSessionsFromJSON}
            onClearDatabase={handleClearDatabase}
            onExportCSV={exportCurrentData}
            onUploadSuccess={loadNewDataset}
          />

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

          {/* Data Visualization */}
          <DataVisualization
            metrics={metrics}
            chartData={chartData}
            dateRange={dateRange}
            isLoadingData={isLoadingData}
            totalSessions={dbStats?.totalSessions}
          />

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
