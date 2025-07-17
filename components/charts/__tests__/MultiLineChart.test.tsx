import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MultiLineChart } from "../MultiLineChart";

interface LineDataset {
  label: string;
  data: number[];
}

// Mock Chart.js
vi.mock("react-chartjs-2", () => ({
  Line: vi.fn(({ data }) => (
    <div data-testid="line-chart">
      {data.datasets.map((dataset: LineDataset, index: number) => (
        <div key={`dataset-${dataset.label}-${index}`} data-testid={`dataset-${index}`}>
          {dataset.label}: {dataset.data.join(", ")}
        </div>
      ))}
    </div>
  ))
}));

vi.mock("../ChartConfig", () => ({
  setupCharts: vi.fn()
}));

describe("MultiLineChart", () => {
  const mockLabels = ["Jan", "Feb", "Mar", "Apr"];
  const mockDatasets = [
    {
      label: "Sessions",
      data: [100, 150, 125, 175],
      borderColor: "#3B82F6"
    },
    {
      label: "Response Time",
      data: [2.5, 3.0, 2.8, 3.2],
      borderColor: "#F59E0B",
      yAxisID: "y1"
    }
  ];

  it("renders title", () => {
    render(<MultiLineChart labels={mockLabels} datasets={mockDatasets} title="Test Chart" />);
    expect(screen.getByText("Test Chart")).toBeInTheDocument();
  });

  it("renders all datasets", () => {
    render(<MultiLineChart labels={mockLabels} datasets={mockDatasets} />);

    expect(screen.getByTestId("dataset-0")).toHaveTextContent("Sessions: 100, 150, 125, 175");
    expect(screen.getByTestId("dataset-1")).toHaveTextContent("Response Time: 2.5, 3, 2.8, 3.2");
  });

  it("handles single dataset", () => {
    const singleDataset = [mockDatasets[0]];
    render(<MultiLineChart labels={mockLabels} datasets={singleDataset} />);

    expect(screen.getByTestId("dataset-0")).toBeInTheDocument();
    expect(screen.queryByTestId("dataset-1")).not.toBeInTheDocument();
  });

  it("handles empty datasets", () => {
    render(<MultiLineChart labels={mockLabels} datasets={[]} />);
    expect(screen.getByText("Trends Over Time")).toBeInTheDocument();
    expect(screen.queryByTestId("dataset-0")).not.toBeInTheDocument();
  });

  it("applies custom options when provided", () => {
    const customOptions = {
      responsive: false,
      scales: {
        y: {
          beginAtZero: false
        }
      }
    };

    render(<MultiLineChart labels={mockLabels} datasets={mockDatasets} options={customOptions} />);

    // Chart would be rendered with custom options
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("handles datasets with different properties", () => {
    const complexDatasets = [
      {
        label: "Dataset 1",
        data: [1, 2, 3],
        borderColor: "#ff0000",
        backgroundColor: "#ff000050",
        fill: true
      },
      {
        label: "Dataset 2",
        data: [3, 2, 1],
        borderColor: "#00ff00"
      }
    ];

    render(<MultiLineChart labels={["A", "B", "C"]} datasets={complexDatasets} />);

    expect(screen.getByTestId("dataset-0")).toHaveTextContent("Dataset 1: 1, 2, 3");
    expect(screen.getByTestId("dataset-1")).toHaveTextContent("Dataset 2: 3, 2, 1");
  });
});
