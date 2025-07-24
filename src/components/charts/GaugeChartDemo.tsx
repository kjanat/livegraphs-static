/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { GaugeChartCircular } from "./GaugeChartCircular";
import { GaugeChartShadcn } from "./GaugeChartShadcn";
import { GaugeChartShadcnAlt } from "./GaugeChartShadcnAlt";

export function GaugeChartDemo() {
  const demoValue = 4.2;
  const maxValue = 5;

  return (
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

      <GaugeChartCircular value={92} title="Success Rate" subtitle="Last 30 days" thickness={0.2} />
    </div>
  );
}
