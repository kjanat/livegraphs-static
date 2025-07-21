/**
 * Notso AI - Metric Tooltip Component for Complex Metrics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { InfoIcon } from "@/components/icons";

interface MetricTooltipProps {
  metric: string;
  value: string | number;
  explanation: string;
  calculation?: string;
  className?: string;
}

const metricExplanations = {
  "Total Conversations": {
    explanation: "The total number of chatbot sessions in the selected time period",
    calculation: "Each unique session_id counts as one conversation"
  },
  "Unique Users": {
    explanation: "Number of distinct users who interacted with the chatbot",
    calculation: "Counted by unique IP addresses or user identifiers"
  },
  "Avg. Conversation Length (min)": {
    explanation: "Average duration of conversations from start to end",
    calculation: "(end_time - start_time) averaged across all sessions"
  },
  "Avg. Response Time (sec)": {
    explanation: "Average time the chatbot takes to respond to user messages",
    calculation: "Measured from user input to bot response, averaged"
  },
  "Resolved Chats (%)": {
    explanation: "Percentage of conversations successfully resolved without escalation",
    calculation: "100 - (escalated sessions / total sessions) × 100"
  },
  "Average Daily Cost (€)": {
    explanation: "Average cost per day for operating the chatbot",
    calculation: "Total token costs divided by number of days in period"
  },
  "Peak Usage Time": {
    explanation: "The hour of day with the highest conversation volume",
    calculation: "Hour with maximum session count across all days"
  },
  "Avg. User Rating": {
    explanation: "Average satisfaction rating given by users after conversations",
    calculation: "Sum of all ratings divided by number of rated sessions (1-5 scale)"
  }
};

export function MetricTooltip({
  metric,
  value,
  explanation,
  calculation,
  className = ""
}: MetricTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClickMode, setIsClickMode] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const metricInfo = metricExplanations[metric as keyof typeof metricExplanations];
  const displayExplanation = explanation || metricInfo?.explanation || "No explanation available";
  const displayCalculation = calculation || metricInfo?.calculation;

  // Handle click outside to close tooltip
  useEffect(() => {
    if (isClickMode && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
          setIsClickMode(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isClickMode, isVisible]);

  return (
    <div className={`relative ${className}`}>
      <div className="bg-secondary p-4 rounded transition-all hover:bg-secondary/80 hover:scale-105 group">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {metric}
            <button
              ref={buttonRef}
              type="button"
              onClick={() => {
                setIsClickMode(true);
                setIsVisible(!isVisible);
              }}
              onMouseEnter={() => {
                if (!isClickMode) {
                  setIsVisible(true);
                }
              }}
              onMouseLeave={() => {
                if (!isClickMode) {
                  setIsVisible(false);
                }
              }}
              onFocus={() => {
                if (!isClickMode) {
                  setIsVisible(true);
                }
              }}
              onBlur={() => {
                if (!isClickMode) {
                  setIsVisible(false);
                }
              }}
              className="opacity-60 hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-primary/50"
              aria-label={`Help for ${metric}`}
              aria-expanded={isVisible}
              aria-haspopup="true"
            >
              <InfoIcon size={14} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="text-xl font-semibold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>

        {/* Tooltip */}
        {isVisible && (
          <div
            ref={tooltipRef}
            className="absolute z-50 bottom-full left-0 mb-2 w-80 max-w-sm bg-card border border-border rounded-lg shadow-lg p-4 animate-in fade-in slide-in-from-bottom-2 duration-200 select-text"
            style={{ userSelect: "text" }}
          >
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-foreground mb-1">{metric}</h4>
                <p className="text-sm text-muted-foreground">{displayExplanation}</p>
              </div>

              {displayCalculation && (
                <div className="border-t pt-2">
                  <h5 className="font-medium text-xs text-foreground mb-1">Calculation</h5>
                  <p className="text-xs text-muted-foreground font-mono bg-secondary/50 p-2 rounded">
                    {displayCalculation}
                  </p>
                </div>
              )}

              <div className="border-t pt-2">
                <p className="text-xs text-muted-foreground">
                  <strong>Current value:</strong>{" "}
                  {typeof value === "number" ? value.toLocaleString() : value}
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export function EnhancedMetricsDisplay({
  metrics
}: {
  metrics: { [key: string]: string | number };
}) {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg animate-in">
      <h2 className="text-xl font-bold mb-4">Key Metrics</h2>
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <MetricTooltip
            key={key}
            metric={key}
            value={value}
            explanation=""
            className="animate-in fade-in duration-500"
          />
        ))}
      </div>
    </div>
  );
}
