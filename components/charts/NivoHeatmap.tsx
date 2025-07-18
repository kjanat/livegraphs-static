/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ResponsiveHeatMap } from "@nivo/heatmap";

interface HeatmapData {
  hour: number;
  day: string;
  count: number;
}

interface NivoHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function NivoHeatmap({ data, title = "Weekly Usage Heatmap" }: NivoHeatmapProps) {
  // Transform data for Nivo format
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a map for quick lookups
  const dataMap = new Map<string, number>();
  data.forEach(({ hour, day, count }) => {
    dataMap.set(`${day}-${hour}`, count);
  });

  // Transform to Nivo format - using the proper format for @nivo/heatmap
  const nivoData = days.map((day) => ({
    id: day,
    data: hours.map((hour) => ({
      x: `${hour}h`,
      y: dataMap.get(`${day}-${hour}`) || 0
    }))
  }));

  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

      <div style={{ height: "300px" }}>
        <ResponsiveHeatMap
          data={nivoData}
          margin={{ top: 30, right: 30, bottom: 30, left: 60 }}
          forceSquare={true}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 36
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: -40
          }}
          colors={{
            type: "sequential",
            scheme: "blues"
          }}
          animate={true}
          hoverTarget="cell"
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Click and drag to explore • Hover for details</span>
        <span>Peak: {maxValue} sessions/hour</span>
      </div>
    </div>
  );
}
