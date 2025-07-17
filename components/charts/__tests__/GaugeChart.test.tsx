import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GaugeChart } from "../GaugeChart";

describe("GaugeChart", () => {
  it("renders title", () => {
    render(<GaugeChart value={4.2} title="Test Rating" />);
    expect(screen.getByText("Test Rating")).toBeInTheDocument();
  });

  it("renders canvas element", () => {
    const { container } = render(<GaugeChart value={4.5} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas?.tagName).toBe("CANVAS");
  });

  it("handles null value", () => {
    render(<GaugeChart value={null} />);
    expect(screen.getByText("Average Rating")).toBeInTheDocument();
    expect(screen.getByText("No rating data available")).toBeInTheDocument();
  });

  it("applies custom title", () => {
    render(<GaugeChart value={3.8} title="User Satisfaction" />);
    expect(screen.getByText("User Satisfaction")).toBeInTheDocument();
  });

  it("applies custom max value", () => {
    const { container } = render(<GaugeChart value={8} max={10} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("applies custom label", () => {
    const { container } = render(<GaugeChart value={75} max={100} label="%" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
