/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { BubbleChart } from "./BubbleChart";

interface CostAnalysisChartProps {
  data: {
    category: string;
    total_cost: number;
    avg_cost: number;
    count: number;
  }[];
}

export function CostAnalysisChart({ data }: CostAnalysisChartProps) {
  return <BubbleChart data={data} title="Cost Analysis by Category" />;
}
