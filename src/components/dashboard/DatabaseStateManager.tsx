/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DatabaseStateManagerProps {
  isInitialized: boolean;
  error: Error | null;
}

/**
 * Displays the current state of the database connection as an alert based on initialization and error status.
 *
 * Renders a neutral alert while the database is initializing, a destructive alert if an error occurs, or nothing if the database is initialized without errors.
 *
 * @param isInitialized - Indicates whether the database has been successfully initialized
 * @param error - An error encountered during database initialization, or null if none
 */
export function DatabaseStateManager({ isInitialized, error }: DatabaseStateManagerProps) {
  if (!isInitialized && !error) {
    return (
      <Alert className="mb-8">
        <AlertDescription>Initializing database...</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertTitle>Database Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
