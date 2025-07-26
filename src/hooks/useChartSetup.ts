/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef } from "react";
import { setupCharts } from "@/components/charts/ChartConfig";

let isSetup = false;

/**
 * Custom hook to ensure Chart.js is properly initialized before use.
 * Uses a singleton pattern to avoid duplicate registrations.
 */
export function useChartSetup() {
  const setupRef = useRef(false);

  useEffect(() => {
    if (!isSetup && !setupRef.current) {
      setupCharts();
      isSetup = true;
      setupRef.current = true;
    }
  }, []);
}
