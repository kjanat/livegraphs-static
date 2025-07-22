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

interface LanguageDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  const isDarkMode = useDarkMode();
  const colors = getChartColors();

  // Validate that labels and values arrays have equal length
  if (!data.labels || !data.values || data.labels.length !== data.values.length) {
    console.error("LanguageDistributionChart: labels and values arrays must have equal length");
    return (
      <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Unable to display chart: Invalid data format</p>
      </div>
    );
  }

  const barData = data.labels.map((label, index) => ({
    language: label,
    sessions: data.values[index]
  }));

  return (
    <div
      className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col"
      role="img"
      aria-labelledby="language-chart-title"
      aria-describedby="language-chart-desc"
    >
      <h3 id="language-chart-title" className="text-xl font-bold mb-4 text-card-foreground">
        Language Distribution
      </h3>
      <div id="language-chart-desc" className="sr-only">
        Bar chart showing the distribution of chatbot sessions across different languages
      </div>
      <div className="flex-1" style={{ minHeight: "300px" }}>
        <ResponsiveBar
          data={barData}
          keys={["sessions"]}
          indexBy="language"
          layout="vertical"
          margin={{ top: 10, right: 30, bottom: 50, left: 60 }}
          padding={0.3}
          colors={[colors.green]}
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
            tickRotation: -45,
            legend: "Language",
            legendPosition: "middle",
            legendOffset: 40
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Sessions",
            legendPosition: "middle",
            legendOffset: -40
          }}
          enableLabel={false}
          enableGridX={false}
          enableGridY={true}
          animate={true}
          motionConfig="stiff"
          tooltip={({ indexValue, value }) => (
            <div style={getNivoTooltipStyles(isDarkMode)}>
              <div style={{ marginBottom: "4px" }}>
                <strong>Language: {indexValue}</strong>
              </div>
              <div style={{ fontSize: "14px" }}>{value} sessions</div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
