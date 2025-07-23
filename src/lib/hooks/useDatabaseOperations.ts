/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { showConfirmClearDatabaseToast } from "@/components/toasts/ConfirmClearDatabaseToast";
import { useDatabase } from "@/hooks/useDatabase";
import { calculateMetrics, exportToCSV, prepareChartData } from "@/lib/dataProcessor";
import { generateSampleData } from "@/lib/sampleData";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";

interface DatabaseStats {
  totalSessions: number;
  dateRange: { min: string; max: string };
}

interface UseDatabaseOperationsReturn {
  // State
  dbStats: DatabaseStats | null;
  dateRange: DateRange | null;
  metrics: Metrics | null;
  chartData: ChartData | null;
  isLoadingData: boolean;

  // Actions
  loadDataForDateRange: (startDate: Date, endDate: Date) => Promise<void>;
  clearAllData: () => void;
  loadSampleData: () => Promise<void>;
  exportCurrentData: () => void;
  refreshStats: (forceReload?: boolean) => void;
  resetDateRange: () => void;
  loadNewDataset: () => Promise<void>;
}

/**
 * Custom hook for database operations and data management
 */
export function useDatabaseOperations(): UseDatabaseOperationsReturn {
  const {
    isInitialized,
    error: dbError,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase,
    db
  } = useDatabase();

  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Initialize database stats
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
        const [newMetrics, newChartData] = await Promise.all([
          calculateMetrics(db, range),
          prepareChartData(db, range)
        ]);

        setMetrics(newMetrics);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data for selected date range");
      } finally {
        setIsLoadingData(false);
      }
    },
    [db]
  );

  const resetDateRange = useCallback(() => {
    setDateRange(null);
    setMetrics(null);
    setChartData(null);
  }, []);

  const clearAllData = useCallback(() => {
    showConfirmClearDatabaseToast(() => {
      clearDatabase();
      setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
      setMetrics(null);
      setChartData(null);
      setDateRange(null);
    });
  }, [clearDatabase]);

  const loadNewDataset = useCallback(async () => {
    if (!isInitialized || dbError) {
      console.warn("Cannot load dataset: database not initialized or has error");
      return;
    }

    try {
      console.log("Loading new dataset...");

      // Clear all existing state first
      setDateRange(null);
      setMetrics(null);
      setChartData(null);
      setIsLoadingData(true);

      // Get fresh database stats
      const stats = getDatabaseStats();
      console.log("Database stats:", stats);
      setDbStats(stats);

      // If we have data, load the complete dataset
      if (stats.totalSessions > 0 && stats.dateRange.min && stats.dateRange.max) {
        console.log("Loading data for full range:", stats.dateRange);

        const startDate = new Date(stats.dateRange.min);
        const endDate = new Date(stats.dateRange.max);
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);

        // Create the date range
        const range: DateRange = { start: startDate, end: endDate };
        setDateRange(range);

        // Calculate metrics and prepare chart data
        if (!db) {
          throw new Error("Database not available");
        }
        const [newMetrics, newChartData] = await Promise.all([
          calculateMetrics(db, range),
          prepareChartData(db, range)
        ]);

        console.log("Loaded metrics and chart data successfully");
        setMetrics(newMetrics);
        setChartData(newChartData);
      } else {
        console.log("No data to load or invalid date range");
      }
    } catch (error) {
      console.error("Error loading new dataset:", error);
      toast.error("Failed to load data after upload");
    } finally {
      setIsLoadingData(false);
    }
  }, [isInitialized, dbError, getDatabaseStats, db]);

  const loadSampleData = useCallback(async () => {
    try {
      const sampleData = generateSampleData();
      const count = await loadSessionsFromJSON(sampleData);

      // Use atomic function to avoid race conditions
      await loadNewDataset();

      toast.success(`Successfully loaded ${count} sample sessions`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load sample data";
      toast.error(errorMessage);
      console.error(err);
    }
  }, [loadSessionsFromJSON, loadNewDataset]);

  const exportCurrentData = useCallback(() => {
    if (!db || !dateRange) {
      toast.error("No data to export");
      return;
    }

    try {
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

      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export data");
    }
  }, [db, dateRange]);

  const refreshStats = useCallback(
    async (forceReload = false) => {
      if (isInitialized && !dbError) {
        const stats = getDatabaseStats();
        setDbStats(stats);

        // If we have data and either no date range selected or forceReload is true, automatically load all data
        if (
          stats.totalSessions > 0 &&
          (!dateRange || forceReload) &&
          stats.dateRange.min &&
          stats.dateRange.max
        ) {
          const startDate = new Date(stats.dateRange.min);
          const endDate = new Date(stats.dateRange.max);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          await loadDataForDateRange(startDate, endDate);
        }
      }
    },
    [isInitialized, dbError, getDatabaseStats, dateRange, loadDataForDateRange]
  );

  return {
    dbStats,
    dateRange,
    metrics,
    chartData,
    isLoadingData,
    loadDataForDateRange,
    clearAllData,
    loadSampleData,
    exportCurrentData,
    refreshStats,
    resetDateRange,
    loadNewDataset
  };
}
