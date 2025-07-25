/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { InfoIcon } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { GaugeChartCircular } from "./GaugeChartCircular";
import { GaugeChartShadcn } from "./GaugeChartShadcn";
import { GaugeChartShadcnAlt } from "./GaugeChartShadcnAlt";

/**
 * Demonstrates and compares multiple gauge chart designs for dashboard analytics.
 *
 * Renders an informational header with interactive descriptions of three gauge chart styles—Radial Bar, Semi-Circular Arc, and Modern Circular—followed by a grid of example charts using sample data and varied configurations.
 */
export function GaugeChartDemo() {
  const demoValue = 4.2;
  const maxValue = 5;

  return (
    <div className="space-y-4">
      {/* Info header */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <HoverCard>
          <HoverCardTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 underline-offset-4 hover:underline cursor-help"
            >
              <InfoIcon className="h-4 w-4" />
              Compare different gauge chart designs
            </button>
          </HoverCardTrigger>
          <HoverCardContent className="w-96">
            <div className="space-y-3">
              <h4 className="text-base font-semibold">Gauge Chart Design Comparison</h4>
              <p className="text-sm text-muted-foreground">
                Choose the gauge design that best fits your dashboard&apos;s visual style and data
                presentation needs.
              </p>
              <div className="space-y-2">
                <div>
                  <h5 className="text-sm font-medium">1. Radial Bar Design</h5>
                  <p className="text-xs text-muted-foreground">
                    Semi-circular progress bar with threshold-based colors. Best for completion
                    rates and progress metrics.
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">2. Semi-Circular Arc Design</h5>
                  <p className="text-xs text-muted-foreground">
                    Minimalist arc with clean stroke. Ideal for multiple metrics in compact spaces.
                  </p>
                </div>
                <div>
                  <h5 className="text-sm font-medium">3. Modern Circular Design</h5>
                  <p className="text-xs text-muted-foreground">
                    270° arc with segment visualization. Perfect for ratings and scores with clear
                    categories.
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic">
                Hover over each chart&apos;s description to learn more about its specific features.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Radial Bar Design */}
        <GaugeChartShadcn
          value={demoValue}
          max={maxValue}
          title="Average Rating"
          description="Customer satisfaction score"
          unit=""
          thresholds={{ low: 2, medium: 3, high: 4 }}
        />

        {/* Semi-circular Arc Design */}
        <GaugeChartShadcnAlt
          value={demoValue}
          max={maxValue}
          title="Performance Score"
          description="Based on response time"
          label="out of 5"
          showPercentage={false}
          size="md"
        />

        {/* Modern Circular Design */}
        <GaugeChartCircular
          value={demoValue}
          max={maxValue}
          title="Overall Score"
          subtitle="Combined metrics"
          size="md"
          formatValue={(val) => val.toFixed(1)}
          segments={[
            { threshold: 20, color: "rgb(239, 68, 68)", label: "Poor" },
            { threshold: 40, color: "rgb(251, 146, 60)", label: "Fair" },
            { threshold: 60, color: "rgb(250, 204, 21)", label: "Good" },
            { threshold: 80, color: "rgb(34, 197, 94)", label: "Very Good" },
            { threshold: 100, color: "rgb(16, 185, 129)", label: "Excellent" }
          ]}
        />

        {/* Percentage Examples */}
        <GaugeChartShadcn value={75} title="Completion Rate" description="Tasks completed" />

        <GaugeChartShadcnAlt value={85} title="Efficiency" size="lg" className="col-span-1" />

        <GaugeChartCircular
          value={92}
          title="Success Rate"
          subtitle="Last 30 days"
          thickness={0.2}
        />
      </div>
    </div>
  );
}
