/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ResponsiveBar } from "@nivo/bar";
import { useEffect, useState } from "react";
import { getChartColors } from "@/lib/utils/chartColors";

interface LanguageDistributionChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function LanguageDistributionChart({ data }: LanguageDistributionChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors = getChartColors();

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

  const barData = data.labels.map((label, index) => ({
    language: label,
    sessions: data.values[index]
  }));

  return (
    <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-4 text-card-foreground">Language Distribution</h3>
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
          theme={{
            background: "transparent",
            text: {
              fontSize: 12,
              fill: isDarkMode ? "#e5e7eb" : "#1f2937"
            },
            axis: {
              domain: {
                line: {
                  stroke: isDarkMode ? "#4b5563" : "#d1d5db"
                }
              },
              ticks: {
                line: {
                  stroke: isDarkMode ? "#4b5563" : "#d1d5db"
                },
                text: {
                  fill: isDarkMode ? "#9ca3af" : "#6b7280"
                }
              },
              legend: {
                text: {
                  fill: isDarkMode ? "#e5e7eb" : "#1f2937"
                }
              }
            },
            grid: {
              line: {
                stroke: isDarkMode ? "#374151" : "#e5e7eb"
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
        />
      </div>
    </div>
  );
}
