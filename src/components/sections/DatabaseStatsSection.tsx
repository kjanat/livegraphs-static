/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

interface DatabaseStatsSectionProps {
  totalSessions: number;
  dateRange: {
    min: string;
    max: string;
  };
}

export function DatabaseStatsSection({ totalSessions, dateRange }: DatabaseStatsSectionProps) {
  return (
    <section
      className="bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg"
      aria-label="Database statistics"
    >
      <h2 className="text-[1.25rem] sm:text-2xl font-bold mb-4">Data Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-primary/10 p-4 rounded transition-colors hover:bg-primary/15">
          <div className="text-sm text-muted-foreground">Total Sessions</div>
          <div className="text-2xl font-bold text-primary">{totalSessions}</div>
        </div>
        <div className="bg-green-600/10 p-4 rounded transition-colors hover:bg-green-600/15">
          <div className="text-sm text-muted-foreground">Data Start Date</div>
          <div className="text-lg font-semibold text-green-600">
            {dateRange.min ? new Date(dateRange.min).toLocaleDateString() : "No data"}
          </div>
        </div>
        <div className="bg-purple-600/10 p-4 rounded transition-colors hover:bg-purple-600/15">
          <div className="text-sm text-muted-foreground">Data End Date</div>
          <div className="text-lg font-semibold text-purple-600">
            {dateRange.max ? new Date(dateRange.max).toLocaleDateString() : "No data"}
          </div>
        </div>
      </div>
    </section>
  );
}
