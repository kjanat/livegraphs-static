/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useMemo } from "react";
import { useDatabase } from "@/hooks/useDatabase";
import { DataService } from "@/services/DataService";

/**
 * Hook to access the DataService instance
 * Automatically initializes the service with database dependencies
 */
export function useDataService() {
  const { db, isInitialized, loadSessionsFromJSON, getDatabaseStats, clearDatabase } =
    useDatabase();

  // Get singleton instance
  const dataService = useMemo(() => DataService.getInstance(), []);

  // Initialize service when database is ready
  useEffect(() => {
    if (isInitialized && db) {
      dataService.initialize(db, {
        loadSessionsFromJSON,
        getDatabaseStats,
        clearDatabase
      });
    }
  }, [db, isInitialized, dataService, loadSessionsFromJSON, getDatabaseStats, clearDatabase]);

  return {
    dataService,
    isReady: isInitialized && dataService.isInitialized()
  };
}
