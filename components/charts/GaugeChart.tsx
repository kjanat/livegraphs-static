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
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);
  const [isReturning, setIsReturning] = useState(false);

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

  // Handle mouse/touch interactions for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const gauge = document.getElementById("gauge-component");
      if (!gauge) return;

      const rect = gauge.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.bottom - 20; // Bottom of semicircle

      let clientX: number, clientY: number;
      if (e instanceof MouseEvent) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }

      // Calculate angle from center
      const deltaX = clientX - centerX;
      const deltaY = centerY - clientY; // Invert Y for proper angle calculation
      let angle = Math.atan2(deltaY, deltaX);

      // Convert to degrees
      angle = (angle * 180) / Math.PI;

      // For semicircle gauge: flip the direction so drag left = arrow left
      // Convert to 0-180 range where 0 = right (1 star), 180 = left (5 stars)
      angle = 90 - angle;

      // Clamp to valid semicircle range
      angle = Math.max(0, Math.min(180, angle));

      // Convert angle to percentage (0-100)
      const percentage = (angle / 180) * 100;

      // Convert percentage back to rating value (1-5)
      const newValue = 1 + (percentage / 100) * (max - 1);
      setDragValue(Math.max(1, Math.min(max, newValue)));
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setIsReturning(true);

        // Smooth spring animation using requestAnimationFrame
        const startValue = dragValue || value || 0;
        const targetValue = value || 0;
        const duration = 800; // ms
        const startTime = performance.now();

        const animate = (currentTime: number) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Spring easing function (elastic out)
          const elasticOut = (t: number) => {
            if (t === 0) return 0;
            if (t === 1) return 1;
            const p = 0.3;
            return 2 ** (-10 * t) * Math.sin(((t - p / 4) * (2 * Math.PI)) / p) + 1;
          };

          const easedProgress = elasticOut(progress);
          const currentValue = startValue + (targetValue - startValue) * easedProgress;

          setDragValue(currentValue);

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDragValue(null);
            setIsReturning(false);
          }
        };

        requestAnimationFrame(animate);
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, max, dragValue, value]);

  if (value === null || value === 0) {
    return (
      <div className="bg-card rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-card-foreground">{title}</h3>
        <div className="text-center text-muted-foreground py-12">No rating data available</div>
      </div>
    );
  }

  // Use drag value if dragging, otherwise use actual value
  const currentValue = dragValue || value;
  const percentage = ((currentValue - 1) / (max - 1)) * 100;

  // Enhanced color array with more vibrant colors
  const colorArray = [
    "#DC2626", // Vibrant Red
    "#F59E0B", // Amber
    "#EAB308", // Yellow
    "#22C55E", // Green
    "#16A34A" // Dark Green
  ];

  // Get rating description
  const getRatingDescription = (val: number) => {
    if (val >= 4.5) return "Excellent";
    if (val >= 3.5) return "Good";
    if (val >= 2.5) return "Average";
    if (val >= 1.5) return "Poor";
    return "Very Poor";
  };

  return (
    <div
      className={`bg-card rounded-lg shadow-md p-6 h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
        isDragging ? "cursor-grabbing" : "cursor-pointer"
      } ${isHovered ? "transform hover:scale-[1.02]" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="img"
      aria-label={`${title}: ${currentValue?.toFixed(1)} out of ${max} stars - ${getRatingDescription(currentValue || 0)}`}
    >
      <h3 className="text-xl font-bold mb-2 text-card-foreground">{title}</h3>
      <div className="flex-1 flex items-center justify-center">
        <button
          type="button"
          className="w-full max-w-[450px] relative bg-transparent border-none p-0 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 rounded-lg"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          aria-label={`Interactive gauge: ${currentValue?.toFixed(1)} out of ${max} stars. Click and drag to explore different values.`}
        >
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
              subArcs: [
                { limit: 20, color: colorArray[0] },
                { limit: 40, color: colorArray[1] },
                { limit: 60, color: colorArray[2] },
                { limit: 80, color: colorArray[3] },
                { limit: 100, color: colorArray[4] }
              ],
              padding: 0.02,
              width: isHovered ? 0.25 : 0.2,
              gradient: true
            }}
            pointer={{
              type: "arrow",
              animationDuration: isDragging ? 0.1 : isReturning ? 0.8 : isHovered ? 0.6 : 0.8,
              animationDelay: isReturning ? 0 : 0.1,
              width: isDragging ? 30 : isHovered ? 25 : 20,
              color: isDragging ? "#F59E0B" : isDarkMode ? "#8B5CF6" : "#7C3AED",
              elastic: isReturning,
              length: isDragging ? 0.9 : 0.8
            }}
          />

          {/* Enhanced information display */}
          <div className="text-center mt-3 space-y-2">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div
              className={`text-lg font-semibold transition-all duration-300 ${
                isHovered || isDragging ? "scale-110" : ""
              } ${isDragging ? "text-amber-500" : ""}`}
            >
              {getRatingDescription(currentValue || 0)}
            </div>
            {(isHovered || isDragging) && (
              <div className="text-xs text-muted-foreground animate-in fade-in duration-300">
                {currentValue?.toFixed(1)} out of {max} stars
                {isDragging && (
                  <span className="block text-amber-500 font-medium">
                    Drag to explore • Release to return
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover glow effect */}
          {isHovered && (
            <div
              className="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse pointer-events-none"
              style={{ transform: "scale(0.8)" }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
