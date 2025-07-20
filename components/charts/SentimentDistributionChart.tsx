/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ResponsivePie } from "@nivo/pie";
import { useEffect, useState } from "react";

interface SentimentDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function SentimentDistributionChart({ data }: SentimentDistributionChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  const pieData = data.labels.map((label, index) => ({
    id: label,
    label: label,
    value: data.values[index],
    color: getColorForSentiment(label)
  }));

  function getColorForSentiment(sentiment: string): string {
    if (sentiment === "Positive") return "#22C55E";
    if (sentiment === "Negative") return "#EF4444";
    if (sentiment === "Neutral") return "#EAB308";
    return "#3B82F6";
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">Sentiment Distribution</h3>
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
          theme={{
            text: {
              fontSize: 12,
              fill: isDarkMode ? "#e5e7eb" : "#1f2937"
            },
            labels: {
              text: {
                fontSize: 12,
                fill: isDarkMode ? "#e5e7eb" : "#1f2937"
              }
            },
            tooltip: {
              container: {
                background: isDarkMode ? "#1f2937" : "#ffffff",
                color: isDarkMode ? "#e5e7eb" : "#1f2937",
                fontSize: 12,
                borderRadius: 4,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }
            }
          }}
          legends={[
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
          ]}
        />
      </div>
    </div>
  );
}
