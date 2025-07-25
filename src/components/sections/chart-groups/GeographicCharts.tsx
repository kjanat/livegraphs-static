/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import dynamic from "next/dynamic";
import { memo } from "react";
import { ChartSkeleton } from "@/components/ui/skeleton";
import type { ChartData } from "@/lib/types/session";
import type { ChartVisibility } from "../chartConfig";

const SessionsByCountryChart = dynamic(
  () =>
    import("@/components/charts/SessionsByCountryChartShadcn").then((mod) => ({
      default: mod.SessionsByCountryChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const LanguageDistributionChart = dynamic(
  () =>
    import("@/components/charts/LanguageDistributionChartShadcn").then((mod) => ({
      default: mod.LanguageDistributionChartShadcn
    })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

interface GeographicChartsProps {
  chartData: ChartData;
  visibility: ChartVisibility;
}

/**
 * Displays geographic analytics charts for chatbot sessions in a responsive grid layout.
 *
 * Renders country-based and language-based session charts based on the provided data and visibility flags.
 *
 * @param chartData - Chart data containing country and language labels and values
 * @param visibility - Flags indicating which charts to display
 */
function GeographicCharts({ chartData, visibility }: GeographicChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {visibility.hasCountryData && (
        <SessionsByCountryChart
          data={{
            labels: chartData.country_labels,
            values: chartData.country_values
          }}
        />
      )}
      {visibility.hasLanguageData && (
        <LanguageDistributionChart
          data={{
            labels: chartData.language_labels,
            values: chartData.language_values
          }}
        />
      )}
    </div>
  );
}

export default memo(GeographicCharts);
