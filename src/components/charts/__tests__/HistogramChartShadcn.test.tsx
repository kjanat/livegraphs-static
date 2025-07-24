import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HistogramChartShadcn } from "../HistogramChartShadcn";

describe("HistogramChartShadcn", () => {
  const mockData = [1, 2, 2, 3, 3, 3, 4, 4, 5];

  it("renders with title", () => {
    render(<HistogramChartShadcn data={mockData} title="Distribution Test" />);
    expect(screen.getByText("Distribution Test")).toBeInTheDocument();
  });

  it("renders with default props", () => {
    render(<HistogramChartShadcn data={mockData} />);
    expect(screen.getByText("Distribution")).toBeInTheDocument();
  });

  it("renders statistics correctly", () => {
    const simpleData = [1, 2, 3, 4, 5];
    render(<HistogramChartShadcn data={simpleData} bins={5} />);

    expect(screen.getByText("Mean")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // Mean of 1,2,3,4,5 is 3

    expect(screen.getByText("Median")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // Median is also 3

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // Total count
  });

  it("handles empty data", () => {
    render(<HistogramChartShadcn data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("handles decimal data correctly", () => {
    const decimalData = [0.1, 0.3, 0.6, 0.8];
    render(<HistogramChartShadcn data={decimalData} bins={4} />);

    // Should show decimal values for statistics
    expect(screen.getByText("0.5")).toBeInTheDocument(); // Mean
  });

  it("handles integer data with integer formatting", () => {
    const integerData = [10, 20, 30, 40, 50];
    render(<HistogramChartShadcn data={integerData} bins={5} />);

    // Should show integer values for statistics
    expect(screen.getByText("30")).toBeInTheDocument(); // Mean and median
  });
});
