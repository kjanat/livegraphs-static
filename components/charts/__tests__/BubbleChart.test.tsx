import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BubbleChart } from "../BubbleChart";

interface BubbleDataPoint {
  x: number;
  y: number;
  r: number;
}

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bubble: vi.fn(({ data }) => {
    // Access the actual data structure
    const dataset = data.datasets[0];
    const bubbleData = (dataset?.data || []) as BubbleDataPoint[];

    return (
      <div data-testid="bubble-chart">
        {bubbleData.map((point: BubbleDataPoint, index: number) => (
          <div key={`bubble-${index}-${point.x}-${point.y}`} data-testid={`bubble-${index}`}>
            x: {point?.x || ""}, y: {point?.y || ""}, r: {point?.r || ""}
          </div>
        ))}
      </div>
    );
  })
}));

describe("BubbleChart", () => {
  const mockData = [
    { category: "Technical", avg_cost: 0.005, count: 150, total_cost: 0.75 },
    { category: "Sales", avg_cost: 0.006, count: 200, total_cost: 1.2 },
    { category: "Support", avg_cost: 0.005, count: 100, total_cost: 0.5 }
  ];

  it("renders title", () => {
    render(<BubbleChart data={mockData} title="Cost Analysis" />);
    expect(screen.getByText("Cost Analysis")).toBeInTheDocument();
  });

  it("transforms data correctly for bubble chart", () => {
    render(<BubbleChart data={mockData} />);

    const bubble0 = screen.getByTestId("bubble-0");
    expect(bubble0).toHaveTextContent("x: 0.005");
    expect(bubble0).toHaveTextContent("y: 0.75");

    const bubble1 = screen.getByTestId("bubble-1");
    expect(bubble1).toHaveTextContent("x: 0.006");
    expect(bubble1).toHaveTextContent("y: 1.2");
  });

  it("calculates bubble radius based on sessions", () => {
    render(<BubbleChart data={mockData} />);

    // Check that bubbles are rendered
    const chart = screen.getByTestId("bubble-chart");
    expect(chart).toBeInTheDocument();

    // Get individual bubble elements
    const bubble0 = screen.getByTestId("bubble-0");
    const bubble1 = screen.getByTestId("bubble-1");
    const bubble2 = screen.getByTestId("bubble-2");

    // The radius is calculated as: Math.sqrt(count / maxCount) * 30 + 5
    // maxCount = 200
    const r0 = Math.sqrt(150 / 200) * 30 + 5;
    const r1 = Math.sqrt(200 / 200) * 30 + 5;
    const r2 = Math.sqrt(100 / 200) * 30 + 5;

    expect(bubble0).toHaveTextContent(`r: ${r0}`);
    expect(bubble1).toHaveTextContent(`r: ${r1}`);
    expect(bubble2).toHaveTextContent(`r: ${r2}`);
  });

  it("handles empty data", () => {
    render(<BubbleChart data={[]} />);
    expect(screen.getByText("Cost Analysis by Category")).toBeInTheDocument();
    expect(screen.queryByTestId("bubble-0")).not.toBeInTheDocument();
  });

  it("handles single data point", () => {
    const singleData = [{ category: "Test", avg_cost: 0.004, count: 50, total_cost: 0.25 }];

    render(<BubbleChart data={singleData} />);
    const bubble = screen.getByTestId("bubble-0");
    expect(bubble).toHaveTextContent("x: 0.004");
    expect(bubble).toHaveTextContent("y: 0.25");
  });

  it("applies custom title", () => {
    render(<BubbleChart data={mockData} title="Custom Title" />);
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });
});
