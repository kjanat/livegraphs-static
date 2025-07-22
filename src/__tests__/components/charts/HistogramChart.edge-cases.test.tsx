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

describe("HistogramChart - Edge Cases for Decimal Formatting", () => {
  it("should handle small integer ranges without decimals", () => {
    // Duration data under 20 minutes
    const smallData = [2, 4, 6, 8, 10, 12, 14, 16, 18];

    const { getByTestId } = render(
      <HistogramChart
        data={smallData}
        bins={5}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // All labels should be integers
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should handle large integer ranges without decimals when appropriate", () => {
    // Duration data over 470 minutes (your specific case)
    const largeData = Array.from({ length: 50 }, (_, i) => i * 10); // 0, 10, 20, ..., 490

    const { getByTestId } = render(
      <HistogramChart
        data={largeData}
        bins={10}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // With data 0-490 and 10 bins, bin width is 49
    // Since 49 is an integer and >= 1, labels should be integers
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should handle the problematic case with values over 470", () => {
    // Specific problematic case mentioned by user
    const problematicData = [10, 50, 100, 150, 200, 250, 300, 350, 400, 450, 475, 480];

    const { getByTestId } = render(
      <HistogramChart
        data={problematicData}
        bins={8}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // With data 10-480 and 8 bins, bin width is 58.75
    // Since this is close to an integer, labels should be rounded
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should handle conversation duration data with decimal minutes", () => {
    // This reproduces the actual data from the screenshot: durations in decimal minutes
    const durationData = [
      0.4, 0.5, 0.7, 1.2, 1.5, 2.3, 3.5, 5.2, 8.7, 12.3, 15.8, 20.5, 25.3, 30.2, 35.7, 40.5, 45.2,
      50.8, 60.3, 75.5, 85.2, 95.7, 120.5, 150.3, 180.7, 210.5, 240.3, 270.8, 300.5, 350.2, 400.7,
      450.3, 480.5, 513.4
    ];

    const { getByTestId } = render(
      <HistogramChart
        data={durationData}
        bins={15}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    console.log("Duration data labels:", labels);
    console.log("Sample data values:", durationData.slice(0, 5), "...", durationData.slice(-5));

    // Since the data contains decimals, labels should show decimals
    const hasDecimals = labels.some((label: string) => label.includes("."));
    expect(hasDecimals).toBe(true);
  });

  it("FIXED: handles user's issue - large integer data with fractional bin width", () => {
    // Create a case similar to user's: large integer data that creates fractional bins
    const fixedData = [0, 471]; // 471 / 10 = 47.1 bin width

    const { getByTestId } = render(
      <HistogramChart
        data={fixedData}
        bins={10}
        title="Conversation Duration Distribution"
        xLabel="Duration (minutes)"
      />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    const binWidth = 471 / 10; // 47.1
    console.log("Fixed large range labels:", labels);
    console.log("Bin width:", binWidth);

    // With the improved logic, integer data should always show integer labels
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should handle edge case with uneven bin widths", () => {
    // Data that creates bins like 33.33333...
    const edgeData = [0, 100, 200, 300, 400, 500];

    const { getByTestId } = render(
      <HistogramChart data={edgeData} bins={15} title="Distribution" xLabel="Value" />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // With data 0-500 and 15 bins, bin width is 33.33...
    // Since this is > 1, we should round to integers
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should handle very large ranges that create decimal bin boundaries", () => {
    // Large range that might create decimal boundaries
    const veryLargeData = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];

    const { getByTestId } = render(
      <HistogramChart data={veryLargeData} bins={7} title="Large Distribution" xLabel="Value" />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // With data 0-10000 and 7 bins, bin width is 1428.57...
    // Since this is a large integer-like value, labels should be integers
    labels.forEach((label: string) => {
      expect(label).toMatch(/^\d+-\d+$/);
      expect(label).not.toContain(".");
    });
  });

  it("should preserve decimals only for truly decimal data", () => {
    // Data with actual decimal values
    const decimalData = [0.5, 1.2, 1.8, 2.3, 2.9, 3.4, 3.7, 4.1];

    const { getByTestId } = render(
      <HistogramChart data={decimalData} bins={4} title="Decimal Distribution" xLabel="Value" />
    );

    const labels = JSON.parse(getByTestId("chart-labels").textContent || "[]");

    // This should preserve decimals
    expect(labels[0]).toContain(".");
  });
});
