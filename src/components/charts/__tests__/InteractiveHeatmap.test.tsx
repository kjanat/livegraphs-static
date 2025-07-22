import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { InteractiveHeatmap } from "../InteractiveHeatmap";

describe("InteractiveHeatmap", () => {
  const mockData = [
    { hour: 9, day: "Mon", count: 15 },
    { hour: 10, day: "Mon", count: 25 },
    { hour: 14, day: "Wed", count: 30 },
    { hour: 16, day: "Fri", count: 5 }
  ];

  it("renders title and legend", () => {
    render(<InteractiveHeatmap data={mockData} title="Test Heatmap" />);

    expect(screen.getByText("Test Heatmap")).toBeInTheDocument();
    expect(screen.getByText("Sessions per hour")).toBeInTheDocument();
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("renders all days and hours", () => {
    const { container } = render(<InteractiveHeatmap data={mockData} />);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (const day of days) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }

    // Check for hour labels in the header row specifically
    const hourLabels = container.querySelectorAll(".flex.mb-2 .flex-1");
    expect(hourLabels).toHaveLength(24);

    // Check that hour labels go from 0 to 23
    hourLabels.forEach((label, index) => {
      expect(label.textContent).toBe(index.toString());
    });
  });

  it("displays correct session counts", () => {
    render(<InteractiveHeatmap data={mockData} />);

    // Find specific buttons by aria-label to avoid conflicts with hour labels
    expect(screen.getByLabelText("Mon 9:00 - 15 sessions")).toHaveTextContent("15");
    expect(screen.getByLabelText("Mon 10:00 - 25 sessions")).toHaveTextContent("25");
    expect(screen.getByLabelText("Wed 14:00 - 30 sessions")).toHaveTextContent("30");
    expect(screen.getByLabelText("Fri 16:00 - 5 sessions")).toHaveTextContent("5");
  });

  it("shows tooltip on hover", () => {
    render(<InteractiveHeatmap data={mockData} />);

    const cellButton = screen.getByLabelText("Mon 9:00 - 15 sessions");
    fireEvent.mouseEnter(cellButton);

    expect(screen.getByText(/Mon at 9:00 -/)).toBeInTheDocument();
    expect(screen.getByText(/15 sessions/)).toBeInTheDocument();
  });

  it("applies correct accessibility attributes", () => {
    render(<InteractiveHeatmap data={mockData} />);

    const cellButton = screen.getByLabelText("Mon 9:00 - 15 sessions");
    expect(cellButton.tagName).toBe("BUTTON");
    expect(cellButton).toHaveAttribute("type", "button");
    expect(cellButton).toHaveAttribute("title", "Mon 9:00 - 15 sessions");
  });

  it("handles empty data gracefully", () => {
    render(<InteractiveHeatmap data={[]} />);

    expect(screen.getByText("Weekly Usage Heatmap")).toBeInTheDocument();
    // Should still render the grid structure
    expect(screen.getByText("Mon")).toBeInTheDocument();
  });

  it("applies hover effects", () => {
    render(<InteractiveHeatmap data={mockData} />);

    const cellButton = screen.getByLabelText("Mon 9:00 - 15 sessions");

    // Check initial state
    expect(cellButton.className).toContain("bg-blue");

    // Hover over the cell
    fireEvent.mouseEnter(cellButton);
    expect(cellButton.className).toContain("transform scale-110");

    // Mouse leave
    fireEvent.mouseLeave(cellButton);
    expect(cellButton.className).not.toContain("transform scale-110");
  });
});
