/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistogramChart } from "@/components/charts/HistogramChart";

// Mock Chart.js
interface MockBarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      [key: string]: unknown;
    }>;
  };
}

vi.mock("react-chartjs-2", () => ({
  Bar: ({ data }: MockBarChartProps) => (
    <div data-testid="bar-chart">
      <div data-testid="chart-labels">{JSON.stringify(data.labels)}</div>
      <div data-testid="chart-data">{JSON.stringify(data.datasets[0].data)}</div>
    </div>
  )
}));

describe("HistogramChart - Decimal Formatting", () => {
  it("should format integer data without decimals", () => {
    // Messages per conversation data (all integers)
    const integerData = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40];

    const { getByTestId, getByText } = render(
      <HistogramChart
        data={integerData}
        bins={5}
        title="Messages per Conversation"
        xLabel="Number of Messages"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // Should not contain decimals
    // With data 4-40 and 5 bins, bin width is 7.2, so bins are:
    // 4-11.2, 11.2-18.4, 18.4-25.6, 25.6-32.8, 32.8-40
    expect(labels[0]).toBe("4-11");
    expect(labels[1]).toBe("11-18");
    expect(labels[2]).toBe("18-26");
    expect(labels[3]).toBe("26-33");
    expect(labels[4]).toBe("33-40");

    // Check statistics formatting
    expect(getByText("22")).toBeInTheDocument(); // Mean
    expect(getByText("22")).toBeInTheDocument(); // Median (same in this case)
  });

  it("should format minute data without unnecessary decimals", () => {
    // Conversation duration data in minutes
    const durationData = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];

    const { getByTestId } = render(
      <HistogramChart
        data={durationData}
        bins={5}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // Should round to integers
    expect(labels[0]).toBe("5-14");
    expect(labels[1]).toBe("14-23");
    expect(labels[2]).toBe("23-32");
    expect(labels[3]).toBe("32-41");
    expect(labels[4]).toBe("41-50");
  });

  it("should preserve decimals for non-integer data", () => {
    // Data with decimal values
    const decimalData = [1.5, 2.3, 3.7, 4.2, 5.8, 6.1, 7.9, 8.4];

    const { getByTestId } = render(
      <HistogramChart data={decimalData} bins={4} title="Response Times" xLabel="Time (seconds)" />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // Should preserve decimals
    expect(labels[0]).toMatch(/^\d+\.\d-\d+\.\d$/);
    expect(labels).toContain("1.5-3.2");
  });

  it("should handle edge case where bins create near-integer boundaries", () => {
    // Data that creates bins with boundaries like 0.0-33.9
    const data = Array.from({ length: 50 }, (_, i) => i * 10);

    const { getByTestId } = render(
      <HistogramChart data={data} bins={15} title="Distribution" xLabel="Value" />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // Should round when bin width is close to integer
    // With data 0-490 and 15 bins, bin width is 32.67
    expect(labels[0]).toBe("0-33");
    expect(labels[14]).toBe("457-490");
  });
});
