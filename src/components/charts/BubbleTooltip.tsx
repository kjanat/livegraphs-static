/**
 * Notso AI - Custom Bubble Chart Tooltip Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import type { TooltipProps } from "recharts";
import { cn } from "@/lib/utils";

interface BubbleData {
  x: number; // avg_cost
  y: number; // total_cost
  r: number; // session count (original)
  name: string; // category
  color: string; // theme color
}

type BubbleTooltipProps = TooltipProps<number, string>;

export function BubbleTooltip({ active, payload }: BubbleTooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as BubbleData;

  return (
    <div
      className={cn(
        "border-border/50 bg-background rounded-lg border px-3 py-2 text-sm shadow-xl",
        "min-w-[10rem] space-y-1.5"
      )}
    >
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Category:</span>
        <span className="font-semibold">{data.name}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Avg Cost:</span>
        <span className="font-semibold">€{data.x.toFixed(4)}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Total Cost:</span>
        <span className="font-semibold">€{data.y.toFixed(2)}</span>
      </div>
      <div className="flex items-center justify-between gap-6">
        <span className="text-muted-foreground">Sessions:</span>
        <span className="font-semibold">{data.r.toLocaleString()}</span>
      </div>
    </div>
  );
}
