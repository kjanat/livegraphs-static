import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AnalyticsChart } from "../AnalyticsChart";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
  Bar: vi.fn(({ data }) => (
    <div data-testid="bar-chart" data-type="bar">
      {data.labels.join(", ")}
    </div>
  )),
  Doughnut: vi.fn(({ data }) => (
    <div data-testid="doughnut-chart" data-type="doughnut">
      {data.labels.join(", ")}
    </div>
  )),
  Line: vi.fn(({ data }) => (
    <div data-testid="line-chart" data-type="line">
      {data.labels.join(", ")}
    </div>
  ))
}));

vi.mock("../ChartConfig", () => ({
  setupCharts: vi.fn()
}));

describe("AnalyticsChart", () => {
  const mockData = {
    labels: ["Label1", "Label2", "Label3"],
    datasets: [
      {
        label: "Test Dataset",
        data: [10, 20, 30],
        backgroundColor: ["#ff0000", "#00ff00", "#0000ff"]
      }
    ]
  };

  it("renders title", () => {
    render(<AnalyticsChart type="bar" title="Test Chart" data={mockData} />);
    expect(screen.getByText("Test Chart")).toBeInTheDocument();
  });

  it("renders bar chart when type is bar", () => {
    render(<AnalyticsChart type="bar" title="Bar Chart" data={mockData} />);

    const chart = screen.getByTestId("bar-chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("data-type", "bar");
    expect(chart).toHaveTextContent("Label1, Label2, Label3");
  });

  it("renders doughnut chart when type is doughnut", () => {
    render(<AnalyticsChart type="doughnut" title="Doughnut Chart" data={mockData} />);

    const chart = screen.getByTestId("doughnut-chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("data-type", "doughnut");
  });

  it("renders line chart when type is line", () => {
    render(<AnalyticsChart type="line" title="Line Chart" data={mockData} />);

    const chart = screen.getByTestId("line-chart");
    expect(chart).toBeInTheDocument();
    expect(chart).toHaveAttribute("data-type", "line");
  });

  it("applies custom options when provided", () => {
    const customOptions = {
      responsive: false,
      plugins: {
        legend: {
          display: false
        }
      }
    };

    render(
      <AnalyticsChart type="bar" title="Custom Options" data={mockData} options={customOptions} />
    );

    // Chart should be rendered with custom options
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("handles empty data", () => {
    const emptyData = {
      labels: [],
      datasets: []
    };

    render(<AnalyticsChart type="bar" title="Empty Chart" data={emptyData} />);
    expect(screen.getByText("Empty Chart")).toBeInTheDocument();
    expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("applies appropriate container styling", () => {
    const { container } = render(
      <AnalyticsChart type="doughnut" title="Styled Chart" data={mockData} />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("bg-card");
    expect(wrapper.className).toContain("rounded-lg");
    expect(wrapper.className).toContain("shadow-md");
  });
});
