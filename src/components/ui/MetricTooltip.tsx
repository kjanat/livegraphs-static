/**
 * Notso AI - Metric Tooltip Component for Complex Metrics (enhanced with shadcn/ui)
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { InfoIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

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
  const metricInfo = metricExplanations[metric as keyof typeof metricExplanations];
  const displayExplanation = explanation || metricInfo?.explanation || "No explanation available";
  const displayCalculation = calculation || metricInfo?.calculation;

  return (
    <div className={cn("relative", className)}>
      <div className="bg-secondary p-4 rounded transition-all hover:bg-secondary/80 hover:scale-105 group">
        <div className="flex items-center justify-between mb-1 min-w-0">
          <div className="text-sm text-muted-foreground flex items-center gap-2 min-w-0">
            <span className="truncate">{metric}</span>
            <HoverCard openDelay={200} closeDelay={100}>
              <HoverCardTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 opacity-60 hover:opacity-100 transition-opacity cursor-help shrink-0 hidden sm:inline-block" />
              </HoverCardTrigger>
              <HoverCardContent className="w-80 max-w-sm select-text" side="top" align="start">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">{metric}</h4>
                    <p className="text-sm text-muted-foreground">{displayExplanation}</p>
                  </div>

                  {displayCalculation && (
                    <div className="border-t pt-3">
                      <h5 className="font-medium text-xs text-foreground mb-1">Calculation</h5>
                      <p className="text-xs text-muted-foreground font-mono bg-secondary/50 p-2 rounded">
                        {displayCalculation}
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Current value:</strong>{" "}
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
        <div className="text-xl font-semibold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
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
    <Card className="mb-8 transition-all duration-200 hover:shadow-lg animate-in">
      <CardHeader>
        <CardTitle className="text-xl">Key Metrics</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
