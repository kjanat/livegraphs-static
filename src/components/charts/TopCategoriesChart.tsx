/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ResponsiveBar } from "@nivo/bar";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { getChartColors } from "@/lib/utils/chartColors";
import { getNivoTheme, getNivoTooltipStyles } from "@/lib/utils/nivoTheme";

interface TopCategoriesChartProps {
  data: {
    labels: string[];
    values: number[];
  };
  limit?: number;
}

export function TopCategoriesChart({ data, limit = 8 }: TopCategoriesChartProps) {
  const isDarkMode = useDarkMode();
  const colors = getChartColors();

  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("TopCategoriesChart: labels and values arrays must have equal length");
    return (
      <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
      </div>
    );
  }

  // Slice both arrays to the same limit to ensure indices align
  const maxLength = Math.min(data.labels.length, data.values.length, limit);
  const slicedLabels = data.labels.slice(0, maxLength);
  const slicedValues = data.values.slice(0, maxLength);

  const barData = slicedLabels.map((label, index) => ({
    category: label,
    sessions: slicedValues[index] ?? 0 // Use nullish coalescing to handle undefined values
  }));

  return (
    <div
      className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col"
      role="img"
      aria-labelledby="categories-chart-title"
      aria-describedby="categories-chart-desc"
    >
      <h3 id="categories-chart-title" className="text-xl font-bold mb-4 text-card-foreground">
        Top Categories
      </h3>
      <div id="categories-chart-desc" className="sr-only">
        Horizontal bar chart showing the most common categories of chatbot sessions
      </div>
      <div className="flex-1" style={{ minHeight: "300px" }}>
        <ResponsiveBar
          data={barData}
          keys={["sessions"]}
          indexBy="category"
          layout="horizontal"
          margin={{ top: 10, right: 30, bottom: 50, left: 150 }}
          padding={0.3}
          colors={[colors.purple]}
          borderColor={{
            from: "color",
            modifiers: [["darker", 1.6]]
          }}
          theme={getNivoTheme(isDarkMode)}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Sessions",
            legendPosition: "middle",
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0
          }}
          enableLabel={false}
          enableGridX={true}
          enableGridY={false}
          animate={true}
          motionConfig="stiff"
          tooltip={({ indexValue, value }) => (
            <div style={getNivoTooltipStyles(isDarkMode)}>
              <div style={{ marginBottom: "4px" }}>
                <strong>{indexValue}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>{value} sessions</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
