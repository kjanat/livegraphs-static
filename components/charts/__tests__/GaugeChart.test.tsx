import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GaugeChart } from "../GaugeChart";

describe("GaugeChart", () => {
  it("renders title", () => {
    render(<GaugeChart value={4.2} title="Test Rating" />);
    expect(screen.getByText("Test Rating")).toBeInTheDocument();
  });

  it("renders gauge component", () => {
    render(<GaugeChart value={4.5} />);
    expect(screen.getByText("stars")).toBeInTheDocument();
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
    render(<GaugeChart value={4} max={5} />);
    expect(screen.getByText("stars")).toBeInTheDocument();
  });

  it("applies custom label", () => {
    render(<GaugeChart value={4} max={5} label="points" />);
    expect(screen.getByText("points")).toBeInTheDocument();
  });
});
