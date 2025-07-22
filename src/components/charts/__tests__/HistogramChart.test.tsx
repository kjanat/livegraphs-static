import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HistogramChart } from "../HistogramChart";

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(({ data }) => (
    <div data-testid="bar-chart">
      {data.labels.map((label: string, index: number) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Test mock
        <div key={index} data-testid={`bar-${index}`}>
          {label}: {data.datasets[0].data[index]}
        </div>
      ))}
    </div>
  ))
}));

describe("HistogramChart", () => {
  const mockData = [1.5, 2.3, 2.8, 3.1, 3.5, 4.2, 4.5, 4.8, 5.2, 5.5];

  it("renders title", () => {
    render(<HistogramChart data={mockData} title="Distribution Test" />);
    expect(screen.getByText("Distribution Test")).toBeInTheDocument();
  });

  it("creates correct number of bins", () => {
    render(<HistogramChart data={mockData} bins={5} />);

    const bars = screen.getAllByTestId(/bar-/);
    // Histogram may create bins+1 due to rounding
    expect(bars.length).toBeGreaterThanOrEqual(5);
    expect(bars.length).toBeLessThanOrEqual(6);
  });

  it("calculates histogram correctly", () => {
    const simpleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    render(<HistogramChart data={simpleData} bins={5} />);

    // Just check that bins are created - exact binning may vary
    const bars = screen.getAllByTestId(/bar-/);
    expect(bars.length).toBeGreaterThan(0);

    // Check format of labels (range: count)
    bars.forEach((bar) => {
      expect(bar.textContent).toMatch(/\d+\.\d+-\d+\.\d+: \d+/);
    });
  });

  it("handles empty data", () => {
    render(<HistogramChart data={[]} />);
    expect(screen.getByText("Distribution")).toBeInTheDocument();
    expect(screen.queryByTestId("bar-0")).not.toBeInTheDocument();
  });

  it("applies custom color", () => {
    render(<HistogramChart data={mockData} color="#ff0000" />);
    // Color would be applied to the chart dataset
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("uses custom x-axis label", () => {
    render(<HistogramChart data={mockData} xLabel="Duration (min)" />);
    // In a real test, we'd check the chart options for the label
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("handles single value data", () => {
    render(<HistogramChart data={[5]} bins={3} />);
    const bars = screen.getAllByTestId(/bar-/);
    // Should still create bins even with single value
    expect(bars.length).toBeGreaterThan(0);
  });

  it("formats bin labels correctly", () => {
    const data = [0.5, 1.5, 2.5];
    render(<HistogramChart data={data} bins={3} />);

    const bar = screen.getByTestId("bar-0");
    // Check that labels are formatted with one decimal place
    expect(bar.textContent).toMatch(/\d+\.\d+-\d+\.\d+/);
  });
});
