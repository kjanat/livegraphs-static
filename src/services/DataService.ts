/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { getQueryCache } from "@/lib/cache/QueryCache";
import { calculateMetrics, exportToCSV, prepareChartData } from "@/lib/dataProcessor";
import type { Database } from "@/lib/db/sql-wrapper";
import { generateSampleData } from "@/lib/sampleData";
import type { ChartData, ChatSession, DateRange, Metrics } from "@/lib/types/session";

interface QueryOptions {
  useCache?: boolean;
  forceRefresh?: boolean;
}

interface DataServiceDependencies {
  loadSessionsFromJSON: (sessions: ChatSession[]) => Promise<number>;
  getDatabaseStats: () => { totalSessions: number; dateRange: { min: string; max: string } };
  clearDatabase: () => void;
}

/**
 * DataService provides a clean API for all data operations.
 * It handles caching, error handling, and coordinate between different data sources.
 */
export class DataService {
  private static instance: DataService | null = null;
  private db: Database | null = null;
  private dependencies: DataServiceDependencies | null = null;
  private cache = getQueryCache();

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance
   */
  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  /**
   * Initialize the service with database and dependencies
   */
  initialize(db: Database, dependencies: DataServiceDependencies): void {
    this.db = db;
    this.dependencies = dependencies;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.db !== null && this.dependencies !== null;
  }

  /**
   * Get metrics for a date range
   */
  async getMetrics(
    dateRange: DateRange,
    options: QueryOptions = { useCache: true }
  ): Promise<Metrics> {
    if (!this.db) throw new Error("DataService not initialized");

    // Check cache first if enabled
    if (options.useCache && !options.forceRefresh) {
      const cached = this.cache.getMetrics(dateRange);
      if (cached) return cached;
    }

    // Calculate fresh metrics
    const metrics = await calculateMetrics(this.db, dateRange);

    // Cache the result
    if (options.useCache) {
      this.cache.setMetrics(dateRange, metrics);
    }

    return metrics;
  }

  /**
   * Get chart data for a date range
   */
  async getChartData(
    dateRange: DateRange,
    options: QueryOptions = { useCache: true }
  ): Promise<ChartData> {
    if (!this.db) throw new Error("DataService not initialized");

    // Check cache first if enabled
    if (options.useCache && !options.forceRefresh) {
      const cached = this.cache.getChartData(dateRange);
      if (cached) return cached;
    }

    // Calculate fresh chart data
    const chartData = await prepareChartData(this.db, dateRange);

    // Cache the result
    if (options.useCache) {
      this.cache.setChartData(dateRange, chartData);
    }

    return chartData;
  }

  /**
   * Get both metrics and chart data efficiently
   */
  async getDataForDateRange(
    dateRange: DateRange,
    options: QueryOptions = { useCache: true }
  ): Promise<{ metrics: Metrics; chartData: ChartData }> {
    if (!this.db) throw new Error("DataService not initialized");

    // Run both queries in parallel
    const [metrics, chartData] = await Promise.all([
      this.getMetrics(dateRange, options),
      this.getChartData(dateRange, options)
    ]);

    return { metrics, chartData };
  }

  /**
   * Load sessions from JSON data
   */
  async loadSessions(sessions: ChatSession[]): Promise<number> {
    if (!this.dependencies) throw new Error("DataService not initialized");

    // Clear cache when loading new data
    this.cache.clear();

    return this.dependencies.loadSessionsFromJSON(sessions);
  }

  /**
   * Load sample data
   */
  async loadSampleData(): Promise<number> {
    const sampleData = generateSampleData();
    return this.loadSessions(sampleData);
  }

  /**
   * Export data to CSV
   */
  exportToCSV(dateRange: DateRange): string {
    if (!this.db) throw new Error("DataService not initialized");
    return exportToCSV(this.db, dateRange);
  }

  /**
   * Get database statistics
   */
  getDatabaseStats(): { totalSessions: number; dateRange: { min: string; max: string } } {
    if (!this.dependencies) throw new Error("DataService not initialized");
    return this.dependencies.getDatabaseStats();
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    if (!this.dependencies) throw new Error("DataService not initialized");

    // Clear database
    this.dependencies.clearDatabase();

    // Clear cache
    this.cache.clear();
  }

  /**
   * Invalidate cache for a specific date range
   */
  invalidateCache(dateRange?: DateRange): void {
    if (dateRange) {
      this.cache.invalidate(dateRange);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Check if a date range has data
   */
  async hasDataForRange(dateRange: DateRange): Promise<boolean> {
    if (!this.db) throw new Error("DataService not initialized");

    const query = `
      SELECT COUNT(*) as count 
      FROM sessions 
      WHERE start_time >= ? AND start_time <= ?
    `;

    const stmt = this.db.prepare(query);
    stmt.bind([dateRange.start.toISOString(), dateRange.end.toISOString()]);

    const result = [];
    while (stmt.step()) {
      result.push(stmt.getAsObject());
    }
    stmt.free();

    return result.length > 0 && (result[0].count as number) > 0;
  }

  /**
   * Reset the service (for testing)
   */
  reset(): void {
    this.db = null;
    this.dependencies = null;
    this.cache.clear();
    DataService.instance = null;
  }
}
