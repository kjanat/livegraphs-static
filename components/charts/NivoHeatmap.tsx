"use client";

import { ResponsiveHeatMap } from "@nivo/heatmap";

interface HeatmapData {
  hour: number;
  day: string;
  count: number;
}

interface NivoHeatmapProps {
  data: HeatmapData[];
  title?: string;
}

export function NivoHeatmap({ data, title = "Weekly Usage Heatmap" }: NivoHeatmapProps) {
  // Transform data for Nivo format
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a map for quick lookups
  const dataMap = new Map<string, number>();
  data.forEach(({ hour, day, count }) => {
    dataMap.set(`${day}-${hour}`, count);
  });

  // Transform to Nivo format
  const nivoData = days.map((day) => {
    const dayData: Record<string, string | number> = { id: day };
    hours.forEach((hour) => {
      dayData[`${hour}h`] = dataMap.get(`${day}-${hour}`) || 0;
    });
    return dayData;
  });

  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>

      <div style={{ height: "300px" }}>
        <ResponsiveHeatMap
          data={nivoData}
          keys={hours.map((h) => `${h}h`)}
          indexBy="id"
          margin={{ top: 30, right: 30, bottom: 30, left: 60 }}
          forceSquare={true}
          axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: 36,
            format: (value) => value.replace("h", ":00")
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: -40
          }}
          cellOpacity={1}
          cellBorderColor={{ from: "color", modifiers: [["darker", 0.4]] }}
          labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
          colors={{
            type: "sequential",
            scheme: "blues",
            minValue: 0,
            maxValue: maxValue
          }}
          animate={true}
          motionConfig="wobbly"
          hoverTarget="cell"
          cellHoverOthersOpacity={0.25}
          tooltip={({ xKey, yKey, value, color }) => (
            <div
              style={{
                background: "white",
                padding: "9px 12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    backgroundColor: color,
                    borderRadius: "2px"
                  }}
                />
                <div>
                  <strong>{yKey}</strong> at <strong>{xKey.replace("h", ":00")}</strong>
                  <br />
                  <span style={{ fontSize: "14px" }}>{value} sessions</span>
                </div>
              </div>
            </div>
          )}
        />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Click and drag to explore • Hover for details</span>
        <span>Peak: {maxValue} sessions/hour</span>
      </div>
    </div>
  );
}
