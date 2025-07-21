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
  refreshStats: () => void;
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

  const clearAllData = useCallback(() => {
    showConfirmClearDatabaseToast(() => {
      clearDatabase();
      setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
      setMetrics(null);
      setChartData(null);
      setDateRange(null);
    });
  }, [clearDatabase]);

  const loadSampleData = useCallback(async () => {
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
      toast.error(errorMessage);
      console.error(err);
    }
  }, [loadSessionsFromJSON, getDatabaseStats]);

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

  const refreshStats = useCallback(() => {
    if (isInitialized && !dbError) {
      const stats = getDatabaseStats();
      setDbStats(stats);
    }
  }, [isInitialized, dbError, getDatabaseStats]);

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
    refreshStats
  };
}
