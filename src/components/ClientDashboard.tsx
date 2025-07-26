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
import { MainDashboardContent } from "@/components/dashboard/MainDashboardContent";
import { useDatabase } from "@/hooks/useDatabase";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { useDatabaseOperations } from "@/lib/hooks/useDatabaseOperations";
import { useFileUpload } from "@/lib/hooks/useFileUpload";

/**
 * Renders the main client dashboard for chatbot conversation analytics, managing state, user interactions, and data visualization.
 *
 * This component orchestrates database state, file uploads, command palette actions, alert dialogs, date range selection, and responsive UI for both mobile and desktop. It conditionally renders sections for file upload, database statistics, date range picker, data visualization, and empty state based on the current database and user interaction state.
 */
export function ClientDashboard() {
  useKeyboardNavigation();

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
        <MainDashboardContent
          dbStats={dbStats}
          dateRange={dateRange}
          metrics={metrics}
          chartData={chartData}
          isLoadingData={isLoadingData}
          isUploading={isUploading}
          uploadError={uploadError}
          isDragging={isDragging}
          onDateRangeChange={loadDataForDateRange}
          onFileUploadForManager={loadSessionsFromJSON}
          onFileUploadForEmpty={handleFileUpload}
          onClearDatabase={handleClearDatabase}
          onExportCSV={exportCurrentData}
          onLoadSampleData={loadSampleData}
          onUploadSuccess={loadNewDataset}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
    </>
  );
}
