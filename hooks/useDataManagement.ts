import { useCallback, useState } from "react";
import { calculateMetrics, prepareChartData } from "@/lib/dataProcessor";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";
import { validateSessionData } from "@/lib/validation/schema";
import { useDatabase } from "./useDatabase";

export function useDataManagement() {
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

  const refreshStats = useCallback(() => {
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

        const [newMetrics, newChartData] = await Promise.all([
          calculateMetrics(db, range),
          prepareChartData(db, range)
        ]);

        setMetrics(newMetrics);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error loading data:", error);
        setUploadError(error instanceof Error ? error.message : "Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    },
    [db]
  );

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);
        const validatedData = validateSessionData(jsonData);
        const count = await loadSessionsFromJSON(validatedData);

        refreshStats();

        // Clear existing data views to force reload
        setMetrics(null);
        setChartData(null);
        setDateRange(null);

        alert(`Successfully loaded ${count} sessions`);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Failed to load file");
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    },
    [loadSessionsFromJSON, refreshStats]
  );

  const handleClearDatabase = useCallback(() => {
    if (confirm("Are you sure you want to clear all data?")) {
      clearDatabase();
      setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
      setMetrics(null);
      setChartData(null);
      setDateRange(null);
    }
  }, [clearDatabase]);

  return {
    // Database state
    isInitialized,
    dbError,
    db,
    dbStats,

    // Data state
    dateRange,
    metrics,
    chartData,
    isLoadingData,

    // Upload state
    uploadError,
    isUploading,

    // Actions
    refreshStats,
    loadDataForDateRange,
    handleFileUpload,
    handleClearDatabase
  };
}
