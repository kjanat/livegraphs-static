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
import type { Database } from "@/lib/db/sql-wrapper";
import { generateSampleData } from "@/lib/sampleData";
import type { ChartData, ChatSession, DateRange, Metrics } from "@/lib/types/session";
import { findRecentWorkingWeekWithData, getWorkingWeekRange } from "@/lib/utils/dateUtils";

interface DatabaseStats {
  totalSessions: number;
  dateRange: { min: string; max: string };
}

interface DatabaseHookData {
  isInitialized: boolean;
  error: Error | null;
  loadSessionsFromJSON: (jsonData: ChatSession[]) => Promise<number>;
  getDatabaseStats: () => DatabaseStats;
  clearDatabase: () => void;
  db: Database | null;
}

interface UseDatabaseOperationsReturn {
  // State
  dbStats: DatabaseStats | null;
  dateRange: DateRange | null;
  metrics: Metrics | null;
  chartData: ChartData | null;
  isLoadingData: boolean;
  showNoDataAlert: boolean;
  setShowNoDataAlert: (show: boolean) => void;

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
export function useDatabaseOperations(
  databaseHook?: DatabaseHookData
): UseDatabaseOperationsReturn {
  const defaultHook = useDatabase();
  const {
    isInitialized,
    error: dbError,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase,
    db
  } = databaseHook || defaultHook;

  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showNoDataAlert, setShowNoDataAlert] = useState(false);

  // State to track if we should auto-load data after stats update
  const [shouldAutoLoad, setShouldAutoLoad] = useState(false);

  // Helper function to check if a date range has data
  const checkDateRangeHasData = useCallback(
    async (start: Date, end: Date): Promise<boolean> => {
      if (!db) return false;

      const query = `
        SELECT COUNT(*) as count 
        FROM sessions 
        WHERE start_time >= ? AND start_time <= ?
      `;

      console.log("checkDateRangeHasData: Checking range", {
        start: start.toISOString(),
        end: end.toISOString()
      });

      const stmt = db.prepare(query);
      stmt.bind([start.toISOString(), end.toISOString()]);
      const result = [];
      while (stmt.step()) {
        result.push(stmt.getAsObject());
      }
      stmt.free();

      const hasData = result.length > 0 && (result[0].count as number) > 0;
      console.log("checkDateRangeHasData: Result", { count: result[0]?.count, hasData });

      return hasData;
    },
    [db]
  );

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
    // Just set the flag - the useEffect will handle loading when stats are ready
    setShouldAutoLoad(true);
  }, []);

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

  // Initialize database stats - re-run when database updates
  useEffect(() => {
    if (isInitialized && !dbError) {
      const stats = getDatabaseStats();
      setDbStats(stats);
    }
  }, [isInitialized, dbError, getDatabaseStats]);

  // Auto-load data when stats are ready and flag is set
  useEffect(() => {
    const loadData = async () => {
      if (
        shouldAutoLoad &&
        dbStats &&
        dbStats.totalSessions > 0 &&
        dbStats.dateRange.min &&
        dbStats.dateRange.max
      ) {
        // Clear the flag first to prevent multiple loads
        setShouldAutoLoad(false);

        const dataMin = new Date(dbStats.dateRange.min);
        const dataMax = new Date(dbStats.dateRange.max);

        console.log("Auto-load: Data range", {
          min: dataMin.toISOString(),
          max: dataMax.toISOString(),
          today: new Date().toISOString()
        });

        // Try to load working week data
        const workingWeekData = await findRecentWorkingWeekWithData(
          dataMin,
          dataMax,
          checkDateRangeHasData
        );

        console.log("Auto-load: Working week data", workingWeekData);

        if (workingWeekData) {
          // Show alert if current week has no data
          setShowNoDataAlert(!workingWeekData.hasCurrentWeekData);

          // Load the data
          await loadDataForDateRange(workingWeekData.start, workingWeekData.end);
        } else {
          // Fall back to loading all data if no working week has data
          console.log("Auto-load: No working week found, loading all data");
          const endDate = new Date(dataMax);
          endDate.setHours(23, 59, 59, 999);
          await loadDataForDateRange(dataMin, endDate);
        }
      }
    };

    loadData();
  }, [shouldAutoLoad, dbStats, loadDataForDateRange, checkDateRangeHasData]);

  return {
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
    refreshStats,
    resetDateRange,
    loadNewDataset
  };
}
