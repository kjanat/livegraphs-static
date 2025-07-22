/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DailyCostTrendChart } from "@/components/charts/DailyCostTrendChart";

// Mock the MultiLineChart component
vi.mock("@/components/charts/MultiLineChart", () => ({
  MultiLineChart: ({ title, labels, datasets, options }: any) => (
    <div data-testid="multi-line-chart">
      <h2>{title}</h2>
      <div data-testid="labels">{JSON.stringify(labels)}</div>
      <div data-testid="datasets">{JSON.stringify(datasets)}</div>
      <div data-testid="options">{JSON.stringify(options)}</div>
    </div>
  )
}));

describe("DailyCostTrendChart", () => {
  it("should render with cost data only (legacy)", () => {
    const data = {
      dates: ["2024-01-01", "2024-01-02", "2024-01-03"],
      values: [10.5, 15.2, 8.3]
    };

    const { getByTestId } = render(<DailyCostTrendChart data={data} />);

    const datasets = JSON.parse(getByTestId("datasets").textContent || "[]");
    expect(datasets).toHaveLength(1);
    expect(datasets[0].label).toBe("Daily Cost (€)");
    expect(datasets[0].data).toEqual([10.5, 15.2, 8.3]);
  });

  it("should render with both cost and message count data", () => {
    const data = {
      dates: ["2024-01-01", "2024-01-02", "2024-01-03"],
      values: [10.5, 15.2, 8.3],
      message_counts: [150, 220, 120]
    };

    const { getByTestId } = render(<DailyCostTrendChart data={data} />);

    const datasets = JSON.parse(getByTestId("datasets").textContent || "[]");
    expect(datasets).toHaveLength(2);

    // Cost dataset
    expect(datasets[0].label).toBe("Daily Cost (€)");
    expect(datasets[0].data).toEqual([10.5, 15.2, 8.3]);
    expect(datasets[0].yAxisID).toBeUndefined(); // Left axis

    // Message count dataset
    expect(datasets[1].label).toBe("Message Count");
    expect(datasets[1].data).toEqual([150, 220, 120]);
    expect(datasets[1].yAxisID).toBe("y1"); // Right axis
  });

  it("should configure dual y-axes when message counts are provided", () => {
    const data = {
      dates: ["2024-01-01", "2024-01-02"],
      values: [10.5, 15.2],
      message_counts: [150, 220]
    };

    const { getByTestId } = render(<DailyCostTrendChart data={data} />);

    const options = JSON.parse(getByTestId("options").textContent || "{}");

    // Check left axis (cost)
    expect(options.scales.y.position).toBe("left");
    expect(options.scales.y.title.text).toBe("Cost (€)");

    // Check right axis (messages)
    expect(options.scales.y1.position).toBe("right");
    expect(options.scales.y1.title.text).toBe("Messages");
    expect(options.scales.y1.grid.drawOnChartArea).toBe(false);
  });

  it("should maintain backward compatibility when message_counts is not provided", () => {
    const data = {
      dates: ["2024-01-01", "2024-01-02"],
      values: [10.5, 15.2]
    };

    const { getByTestId } = render(<DailyCostTrendChart data={data} />);

    const options = JSON.parse(getByTestId("options").textContent || "{}");

    // Should only have y axis, not y1
    expect(options.scales.y).toBeDefined();
    expect(options.scales.y1).toBeUndefined();
  });
});
