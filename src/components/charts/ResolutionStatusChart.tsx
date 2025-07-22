/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ResponsivePie } from "@nivo/pie";
import { useDarkMode } from "@/lib/hooks/useDarkMode";
import { useMobile } from "@/lib/hooks/useMobile";
import { getNivoTheme, getNivoTooltipStyles } from "@/lib/utils/nivoTheme";

interface ResolutionStatusChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function ResolutionStatusChart({ data }: ResolutionStatusChartProps) {
  const isDarkMode = useDarkMode();
  const isMobile = useMobile();

  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("ResolutionStatusChart: labels and values arrays must have equal length");
    return (
      <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
      </div>
    );
  }

  // Calculate total for percentage calculation
  const total = data.values.reduce((sum, val) => sum + (val ?? 0), 0);

  // Create pieData with safe mapping to prevent undefined values
  const maxLength = Math.min(data.labels.length, data.values.length);
  const pieData = data.labels
    .slice(0, maxLength)
    .map((label, index) => ({
      id: label,
      label: label,
      value: total > 0 ? (data.values[index] ?? 0) / total : 0, // Convert to percentage as decimal
      rawValue: data.values[index] ?? 0, // Keep raw value for tooltip
      color: getColorForResolution(label)
    }))
    .filter((item) => item.rawValue > 0); // Filter out items with zero values

  function getColorForResolution(resolution: string): string {
    if (resolution === "Resolved") return "#22C55E";
    if (resolution === "Escalated") return "#EF4444";
    return "#3B82F6";
  }

  return (
    <div
      className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col"
      role="img"
      aria-labelledby="resolution-chart-title"
      aria-describedby="resolution-chart-desc"
    >
      <h3 id="resolution-chart-title" className="text-xl font-bold mb-4 text-card-foreground">
        Resolution Status
      </h3>
      <div id="resolution-chart-desc" className="sr-only">
        Donut chart showing the resolution status of chatbot sessions, including resolved and
        escalated cases
      </div>
      <div className="flex-1" style={{ minHeight: "300px" }}>
        <ResponsivePie
          data={pieData}
          margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
          innerRadius={0.5}
          padAngle={0.7}
          cornerRadius={3}
          activeOuterRadiusOffset={8}
          borderWidth={1}
          borderColor={{
            from: "color",
            modifiers: [["darker", 0.2]]
          }}
          colors={{ datum: "data.color" }}
          arcLinkLabelsSkipAngle={10}
          arcLinkLabelsTextColor={isDarkMode ? "#e5e7eb" : "#333333"}
          arcLinkLabelsThickness={2}
          arcLinkLabelsColor={{ from: "color" }}
          arcLabelsSkipAngle={10}
          arcLabelsTextColor={{
            from: "color",
            modifiers: [["darker", 2]]
          }}
          arcLabel="formattedValue"
          valueFormat=">-.1%"
          theme={getNivoTheme(isDarkMode)}
          tooltip={({ datum }) => (
            <div style={getNivoTooltipStyles(isDarkMode)}>
              <div style={{ marginBottom: "4px" }}>
                <strong>{datum.id}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>
                {datum.data.rawValue} sessions ({(datum.value * 100).toFixed(1)}%)
              </div>
            </div>
          )}
          legends={
            isMobile
              ? []
              : [
                  {
                    anchor: "bottom",
                    direction: "row",
                    justify: false,
                    translateX: 0,
                    translateY: 56,
                    itemsSpacing: 0,
                    itemWidth: 100,
                    itemHeight: 18,
                    itemTextColor: isDarkMode ? "#9ca3af" : "#6b7280",
                    itemDirection: "left-to-right",
                    itemOpacity: 1,
                    symbolSize: 18,
                    symbolShape: "circle",
                    effects: [
                      {
                        on: "hover",
                        style: {
                          itemTextColor: isDarkMode ? "#e5e7eb" : "#1f2937"
                        }
                      }
                    ]
                  }
                ]
          }
        />
      </div>
    </div>
  );
}
