/**
 * Notso AI - Enhanced Chart Component with Fullscreen and Export
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Download, Expand } from "lucide-react";
import { type ReactElement, useRef, useState } from "react";
import { ChartWrapper } from "@/components/ui/ChartWrapper";
import { FullscreenModal } from "@/components/ui/FullscreenModal";

interface EnhancedChartProps {
  title: string;
  children: ReactElement;
  exportFileName?: string;
  className?: string;
}

export function EnhancedChart({
  title,
  children,
  exportFileName = "chart",
  className = ""
}: EnhancedChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!chartRef.current) return;

    try {
      const canvas = chartRef.current.querySelector("canvas");
      if (!canvas) return;

      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${exportFileName}_${new Date().toISOString().split("T")[0]}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to export chart:", error);
    }
  };

  const chartElement = (
    <div ref={chartRef} className="w-full h-full">
      {children}
    </div>
  );

  return (
    <>
      <ChartWrapper className={className}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="Export chart"
              title="Export as PNG"
            >
              <Download className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              aria-label="View fullscreen"
              title="View fullscreen"
            >
              <Expand className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
        {chartElement}
      </ChartWrapper>

      <FullscreenModal isOpen={isFullscreen} onClose={() => setIsFullscreen(false)} title={title}>
        <div className="h-full flex items-center justify-center">
          <div className="w-full max-w-6xl h-[80vh]">{chartElement}</div>
        </div>
      </FullscreenModal>
    </>
  );
}
