/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const GaugeComponent = dynamic(() => import("react-gauge-component"), { ssr: false });

interface GaugeChartProps {
  value: number | null;
  max?: number;
  title?: string;
  label?: string;
}

export function GaugeChart({
  value,
  max = 5,
  title = "Average Rating",
  label = "stars"
}: GaugeChartProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
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

  if (value === null || value === 0) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
        <div className="text-center text-muted-foreground py-12">No rating data available</div>
      </div>
    );
  }

  // Convert value to percentage (1-5 scale to 0-100)
  const percentage = ((value - 1) / (max - 1)) * 100;

  // Define color array for the gauge
  const colorArray = [
    "#EF4444", // Red
    "#F59E0B", // Orange
    "#22C55E" // Green
  ];

  return (
    <div className="bg-card rounded-lg shadow-md p-6 h-full flex flex-col">
      <h3 className="text-xl font-bold mb-2 text-card-foreground">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-[450px]">
          <GaugeComponent
            id="gauge-component"
            value={percentage}
            type="semicircle"
            marginInPercent={{
              top: 0.08,
              bottom: 0.0,
              left: 0.08,
              right: 0.08
            }}
            labels={{
              tickLabels: {
                type: "inner",
                ticks: [{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }],
                defaultTickValueConfig: {
                  formatTextValue: (val) => {
                    const num = parseFloat(val);
                    if (num === 0) return "1";
                    if (num === 25) return "2";
                    if (num === 50) return "3";
                    if (num === 75) return "4";
                    if (num === 100) return "5";
                    return "";
                  },
                  style: {
                    fontSize: "10px",
                    fill: isDarkMode ? "#9CA3AF" : "#6B7280"
                  }
                }
              },
              valueLabel: {
                formatTextValue: () => value.toFixed(1),
                style: {
                  fontSize: "24px",
                  fill: isDarkMode ? "#ededed" : "#1F2937",
                  fontWeight: "bold",
                  textShadow: "none"
                }
              }
            }}
            arc={{
              colorArray: colorArray,
              subArcs: [{ limit: 33.33 }, { limit: 66.67 }, { limit: 100 }],
              padding: 0.02,
              width: 0.2,
              gradient: true
            }}
            pointer={{
              type: "blob",
              animationDuration: 0.4,
              width: 20,
              color: isDarkMode ? "#6B7280" : "#374151"
            }}
          />
          <div className="text-center text-sm text-muted-foreground mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}
