/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DATA_PROCESSING_THRESHOLDS } from "@/lib/config/data-processing-thresholds";

type GaugeMode = "idle" | "hover" | "drag" | "spring";

interface UseDragGaugeReturn {
  percentage: number;
  rating: number;
  mode: GaugeMode;
  startDrag: (e: React.PointerEvent) => void;
  keyAdjust: (e: React.KeyboardEvent) => void;
  setHovered: (hovered: boolean) => void;
}

/**
 * Provides interactive state and event handlers for a draggable, semicircular gauge component with support for pointer and keyboard input.
 *
 * Enables smooth dragging, keyboard adjustment, hover state management, and animated spring-back to the original value. Returns the current fill percentage, rounded rating, interaction mode, and handlers for drag, keyboard, and hover events.
 *
 * @param value - The current gauge value, or null if unset
 * @param max - The maximum gauge value (default is 5)
 * @returns An object containing the current percentage, rating, mode, and event handlers for drag, keyboard, and hover interactions
 */
export function useDragGauge(value: number | null, max = 5): UseDragGaugeReturn {
  const [mode, setMode] = useState<GaugeMode>("idle");
  const [dragValue, setDragValue] = useState<number | null>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const gaugeRef = useRef<HTMLElement | null>(null);

  // Current displayed value
  const currentValue = dragValue ?? value ?? 0;
  const percentage = value === null ? 0 : ((currentValue - 1) / (max - 1)) * 100;
  const rating = Math.round(currentValue);

  // Spring animation back to original value
  const springBack = useCallback(() => {
    if (value === null) return;

    const startValue = dragValue || value;
    const targetValue = value;
    const duration = 800;
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
      const animatedValue = startValue + (targetValue - startValue) * easedProgress;

      setDragValue(animatedValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDragValue(null);
        setMode("idle");
      }
    };

    setMode("spring");
    animationRef.current = requestAnimationFrame(animate);
  }, [dragValue, value]);

  // Handle pointer move during drag
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (mode !== "drag" || !gaugeRef.current) return;

      const rect = gaugeRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.bottom - DATA_PROCESSING_THRESHOLDS.gauge.dragRadiusPadding; // Bottom of semicircle

      // Calculate angle from center
      const deltaX = e.clientX - centerX;
      const deltaY = centerY - e.clientY;
      let angle = Math.atan2(deltaY, deltaX);

      // Convert to degrees and adjust for semicircle
      angle = (angle * DATA_PROCESSING_THRESHOLDS.gauge.semicircleAngle) / Math.PI;
      angle = DATA_PROCESSING_THRESHOLDS.gauge.angleOffset - angle;

      // Clamp to valid semicircle range
      angle = Math.max(0, Math.min(DATA_PROCESSING_THRESHOLDS.gauge.semicircleAngle, angle));

      // Convert angle to rating value
      const percentage =
        (angle / DATA_PROCESSING_THRESHOLDS.gauge.semicircleAngle) *
        DATA_PROCESSING_THRESHOLDS.percentages.multiplier;
      const newValue = 1 + (percentage / 100) * (max - 1);
      setDragValue(Math.max(1, Math.min(max, newValue)));
    },
    [mode, max]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    if (mode === "drag") {
      springBack();
    }
  }, [mode, springBack]);

  // Start dragging
  const startDrag = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setMode("drag");

    // Store gauge element reference
    const gauge = e.currentTarget.closest("[data-gauge-container]");
    if (gauge instanceof HTMLElement) {
      gaugeRef.current = gauge;
    }
  }, []);

  // Keyboard navigation
  const keyAdjust = useCallback(
    (e: React.KeyboardEvent) => {
      if (!value) return;

      const step = 0.5;
      let newValue = value;

      switch (e.key) {
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault();
          newValue = Math.max(1, value - step);
          break;
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault();
          newValue = Math.min(max, value + step);
          break;
        case "Home":
          e.preventDefault();
          newValue = 1;
          break;
        case "End":
          e.preventDefault();
          newValue = max;
          break;
        default:
          return;
      }

      // Temporarily show the new value
      setDragValue(newValue);
      setMode("spring");

      // Spring back after a moment
      setTimeout(() => springBack(), DATA_PROCESSING_THRESHOLDS.gauge.animationSpringbackDelay);
    },
    [value, max, springBack]
  );

  // Handle hover state
  const setHovered = useCallback(
    (hovered: boolean) => {
      if (mode === "idle") {
        setMode(hovered ? "hover" : "idle");
      }
    },
    [mode]
  );

  // Global pointer event listeners
  useEffect(() => {
    if (mode === "drag") {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [mode, handlePointerMove, handlePointerUp]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    percentage,
    rating,
    mode,
    startDrag,
    keyAdjust,
    setHovered
  };
}
