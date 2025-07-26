/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { DataVisualization } from "@/components/dashboard/DataVisualization";
import { FileUploadManager } from "@/components/dashboard/FileUploadManager";
import { MobileDatabaseStats } from "@/components/mobile/MobileDatabaseStats";
import { DatabaseStatsSection } from "@/components/sections/DatabaseStatsSection";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/EmptyState";
import { createDateRangePresets } from "@/lib/constants/dateRangePresets";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";
import type { ChartData, ChatSession, DateRange, Metrics } from "@/lib/types/session";

interface DatabaseStats {
  totalSessions: number;
  dateRange: { min: string; max: string };
}

interface MainDashboardContentProps {
  dbStats: DatabaseStats | null;
  dateRange: DateRange | null;
  metrics: Metrics | null;
  chartData: ChartData | null;
  isLoadingData: boolean;

  // File upload props
  isUploading: boolean;
  uploadError: string | null;
  isDragging: boolean;

  // Handlers
  onDateRangeChange: (startDate: Date, endDate: Date) => void;
  onFileUploadForManager: (jsonData: ChatSession[]) => Promise<number>;
  onFileUploadForEmpty: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDatabase: () => void;
  onExportCSV: () => void;
  onLoadSampleData: () => void;
  onUploadSuccess: () => Promise<void>;

  // Drag handlers
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

/**
 * Renders the main dashboard content including file upload, database stats, date picker, and data visualization.
 *
 * Manages the layout and conditional rendering of dashboard sections based on data availability and responsive breakpoints.
 */
export function MainDashboardContent({
  dbStats,
  dateRange,
  metrics,
  chartData,
  isLoadingData,
  isUploading,
  uploadError,
  isDragging,
  onDateRangeChange,
  onFileUploadForManager,
  onFileUploadForEmpty,
  onClearDatabase,
  onExportCSV,
  onLoadSampleData,
  onUploadSuccess,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop
}: MainDashboardContentProps) {
  const isMobile = useIsMobile();

  // Computed values
  const hasData = (dbStats?.totalSessions ?? 0) > 0;
  const hasDateRange = !!dateRange;

  return (
    <>
      {/* File Upload Section */}
      <FileUploadManager
        hasData={hasData}
        hasDateRange={hasDateRange}
        isUploading={isUploading}
        uploadError={uploadError}
        onFileUpload={onFileUploadForManager}
        onClearDatabase={onClearDatabase}
        onExportCSV={onExportCSV}
        onUploadSuccess={onUploadSuccess}
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
              onDateRangeChange(range.from, range.to);
            }
          }}
          minDate={new Date(dbStats.dateRange.min)}
          maxDate={new Date(dbStats.dateRange.max)}
          presets={createDateRangePresets(dbStats.dateRange)}
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
          onDragEnter={onDragEnter}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={isDragging ? "ring-2 ring-primary ring-offset-2 rounded-lg" : ""}
          aria-label="Drop zone for JSON files"
        >
          <EmptyState onSampleData={onLoadSampleData} onFileUpload={onFileUploadForEmpty} />
        </section>
      )}
    </>
  );
}
