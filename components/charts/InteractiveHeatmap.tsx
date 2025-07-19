/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";

interface HeatmapData {
  hour: number;
  day: string;
  count: number;
}

interface InteractiveHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function InteractiveHeatmap({
  data,
  title = "Weekly Usage Heatmap"
}: InteractiveHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ hour: number; day: string } | null>(null);

  // Days and hours for the grid
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a map for quick lookups
  const dataMap = new Map<string, number>();
  data.forEach(({ hour, day, count }) => {
    dataMap.set(`${day}-${hour}`, count);
  });

  // Find max value for color scaling
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Get color based on count
  const getCellColor = (count: number) => {
    if (count === 0) return "bg-secondary";
    const intensity = count / maxCount;
    if (intensity < 0.2) return "bg-blue-100";
    if (intensity < 0.4) return "bg-blue-200";
    if (intensity < 0.6) return "bg-blue-300";
    if (intensity < 0.8) return "bg-blue-400";
    return "bg-blue-500";
  };

  // Get hover color
  const getHoverColor = (count: number) => {
    if (count === 0) return "hover:bg-secondary/80";
    const intensity = count / maxCount;
    if (intensity < 0.2) return "hover:bg-blue-200";
    if (intensity < 0.4) return "hover:bg-blue-300";
    if (intensity < 0.6) return "hover:bg-blue-400";
    if (intensity < 0.8) return "hover:bg-blue-500";
    return "hover:bg-blue-600";
  };

  // Get text color based on background intensity
  const getTextColor = (count: number) => {
    const intensity = count / maxCount;
    return intensity > 0.6 ? "text-white" : "text-muted-foreground";
  };

  return (
    <div className="bg-card rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">{title}</h3>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-12" /> {/* Spacer for day labels */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="flex-1 text-center text-xs text-muted-foreground min-w-[2.5rem]"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Grid */}
          {days.map((day) => (
            <div key={day} className="flex items-center mb-1">
              {/* Day label */}
              <div className="w-12 text-sm font-medium text-muted-foreground pr-2 text-right">
                {day}
              </div>

              {/* Hour cells */}
              {hours.map((hour) => {
                const count = dataMap.get(`${day}-${hour}`) || 0;
                const isHovered = hoveredCell?.day === day && hoveredCell?.hour === hour;

                return (
                  <button
                    key={`${day}-${hour}`}
                    type="button"
                    className={`
                      flex-1 aspect-square flex items-center justify-center
                      text-xs font-medium rounded cursor-pointer
                      transition-all duration-200 mx-0.5 min-w-[2.5rem]
                      ${getCellColor(count)} ${getHoverColor(count)}
                      ${isHovered ? "transform scale-110 shadow-lg z-10" : ""}
                      ${count > 0 ? getTextColor(count) : "text-muted-foreground/60"}
                    `}
                    onMouseEnter={() => setHoveredCell({ hour, day })}
                    onMouseLeave={() => setHoveredCell(null)}
                    title={`${day} ${hour}:00 - ${count} sessions`}
                    aria-label={`${day} ${hour}:00 - ${count} sessions`}
                  >
                    {count > 0 && <span className={isHovered ? "font-bold" : ""}>{count}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Sessions per hour</div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex gap-1">
            <div className="w-6 h-4 bg-secondary rounded" />
            <div className="w-6 h-4 bg-blue-100 rounded" />
            <div className="w-6 h-4 bg-blue-200 rounded" />
            <div className="w-6 h-4 bg-blue-300 rounded" />
            <div className="w-6 h-4 bg-blue-400 rounded" />
            <div className="w-6 h-4 bg-blue-500 rounded" />
          </div>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCell && (
        <div className="mt-2 text-sm text-muted-foreground text-center">
          {hoveredCell.day} at {hoveredCell.hour}:00 -{" "}
          <span className="font-semibold">
            {dataMap.get(`${hoveredCell.day}-${hoveredCell.hour}`) || 0} sessions
          </span>
        </div>
      )}
    </div>
  );
}
