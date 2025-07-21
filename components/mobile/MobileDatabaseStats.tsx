/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";
import { BarChart3Icon, CalendarIcon, FileIcon } from "@/components/icons/index";

interface MobileDatabaseStatsProps {
  totalSessions: number;
  dateRange: {
    min: string;
    max: string;
  };
}

export function MobileDatabaseStats({ totalSessions, dateRange }: MobileDatabaseStatsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      className="bg-card rounded-lg shadow-sm mb-4 transition-all duration-200"
      aria-label="Database statistics"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <FileIcon size={18} className="text-muted-foreground" />
          <h2 className="text-base font-semibold">Database Statistics</h2>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
            {totalSessions} sessions
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>Toggle statistics section</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 border-t border-border/50">
          <div className="mt-3 space-y-3">
            <div className="bg-primary/10 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3Icon size={14} className="text-primary" />
                <div className="text-xs text-muted-foreground font-medium">Total Sessions</div>
              </div>
              <div className="text-xl font-bold text-primary">{totalSessions}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-600/10 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon size={14} className="text-green-600" />
                  <div className="text-xs text-muted-foreground font-medium">Start Date</div>
                </div>
                <div className="text-sm font-semibold text-green-600">
                  {dateRange.min ? new Date(dateRange.min).toLocaleDateString() : "No data"}
                </div>
              </div>

              <div className="bg-purple-600/10 p-3 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarIcon size={14} className="text-purple-600" />
                  <div className="text-xs text-muted-foreground font-medium">End Date</div>
                </div>
                <div className="text-sm font-semibold text-purple-600">
                  {dateRange.max ? new Date(dateRange.max).toLocaleDateString() : "No data"}
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-1">
              {dateRange.min && dateRange.max && (
                <>
                  Data spans{" "}
                  {Math.ceil(
                    (new Date(dateRange.max).getTime() - new Date(dateRange.min).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
