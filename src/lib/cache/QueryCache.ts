/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ChartData, DateRange, Metrics } from "@/lib/types/session";

interface CachedResult<T> {
  data: T;
  timestamp: number;
  dateRange: DateRange;
}

interface CacheEntry {
  metrics?: CachedResult<Metrics>;
  chartData?: CachedResult<ChartData>;
}

/**
 * QueryCache provides an in-memory cache for expensive database queries and calculations.
 * Caches are keyed by date range to avoid recalculation of the same data.
 */
export class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private maxAge = 5 * 60 * 1000; // 5 minutes cache TTL
  private maxEntries = 50; // Maximum cache entries to prevent memory issues

  /**
   * Generate a cache key from a date range
   */
  private getKey(dateRange: DateRange): string {
    return `${dateRange.start.toISOString()}_${dateRange.end.toISOString()}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isValid<T>(cached: CachedResult<T> | undefined): boolean {
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.maxAge;
  }

  /**
   * Get metrics from cache
   */
  getMetrics(dateRange: DateRange): Metrics | null {
    const key = this.getKey(dateRange);
    const entry = this.cache.get(key);

    if (entry?.metrics && this.isValid(entry.metrics)) {
      return entry.metrics.data;
    }

    return null;
  }

  /**
   * Get chart data from cache
   */
  getChartData(dateRange: DateRange): ChartData | null {
    const key = this.getKey(dateRange);
    const entry = this.cache.get(key);

    if (entry?.chartData && this.isValid(entry.chartData)) {
      return entry.chartData.data;
    }

    return null;
  }

  /**
   * Set metrics in cache
   */
  setMetrics(dateRange: DateRange, data: Metrics): void {
    const key = this.getKey(dateRange);
    const entry = this.cache.get(key) || {};

    entry.metrics = {
      data,
      timestamp: Date.now(),
      dateRange
    };

    this.cache.set(key, entry);
    this.evictIfNeeded();
  }

  /**
   * Set chart data in cache
   */
  setChartData(dateRange: DateRange, data: ChartData): void {
    const key = this.getKey(dateRange);
    const entry = this.cache.get(key) || {};

    entry.chartData = {
      data,
      timestamp: Date.now(),
      dateRange
    };

    this.cache.set(key, entry);
    this.evictIfNeeded();
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear cache entries for a specific date range
   */
  invalidate(dateRange?: DateRange): void {
    if (!dateRange) {
      this.clear();
      return;
    }

    const key = this.getKey(dateRange);
    this.cache.delete(key);
  }

  /**
   * Clear cache entries that overlap with a date range
   */
  invalidateOverlapping(dateRange: DateRange): void {
    const entries = Array.from(this.cache.entries());

    for (const [key, entry] of entries) {
      const cachedRange = entry.metrics?.dateRange || entry.chartData?.dateRange;
      if (cachedRange && this.rangesOverlap(cachedRange, dateRange)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Check if two date ranges overlap
   */
  private rangesOverlap(range1: DateRange, range2: DateRange): boolean {
    return range1.start <= range2.end && range2.start <= range1.end;
  }

  /**
   * Evict oldest entries if cache size exceeds limit
   */
  private evictIfNeeded(): void {
    if (this.cache.size <= this.maxEntries) return;

    // Get all entries sorted by timestamp (oldest first)
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        timestamp: Math.min(
          entry.metrics?.timestamp || Infinity,
          entry.chartData?.timestamp || Infinity
        )
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries until we're under the limit
    const toRemove = entries.slice(0, this.cache.size - this.maxEntries);
    toRemove.forEach(({ key }) => this.cache.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    entries: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
  } {
    const timestamps: number[] = [];

    this.cache.forEach((entry) => {
      if (entry.metrics) timestamps.push(entry.metrics.timestamp);
      if (entry.chartData) timestamps.push(entry.chartData.timestamp);
    });

    return {
      size: this.cache.size,
      entries: timestamps.length,
      oldestEntry: timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null,
      newestEntry: timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null
    };
  }
}

// Singleton instance
let cacheInstance: QueryCache | null = null;

/**
 * Get the singleton cache instance
 */
export function getQueryCache(): QueryCache {
  if (!cacheInstance) {
    cacheInstance = new QueryCache();
  }
  return cacheInstance;
}
