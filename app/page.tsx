"use client";

import { useCallback, useEffect, useState } from "react";
import { AnalyticsChart } from "@/components/charts/AnalyticsChart";
import { BubbleChart } from "@/components/charts/BubbleChart";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { HistogramChart } from "@/components/charts/HistogramChart";
import { InteractiveHeatmap } from "@/components/charts/InteractiveHeatmap";
import { MultiLineChart } from "@/components/charts/MultiLineChart";
import { Logo } from "@/components/Logo";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { useDatabase } from "@/hooks/useDatabase";
import { calculateMetrics, exportToCSV, prepareChartData } from "@/lib/dataProcessor";
import type { ChartData, DateRange, Metrics } from "@/lib/types/session";
import { validateSessionData } from "@/lib/validation/schema";

export default function Home() {
  const {
    isInitialized,
    error: dbError,
    loadSessionsFromJSON,
    getDatabaseStats,
    clearDatabase,
    db
  } = useDatabase();
  const [dbStats, setDbStats] = useState<{
    totalSessions: number;
    dateRange: { min: string; max: string };
  } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (isInitialized && !dbError) {
      const stats = getDatabaseStats();
      setDbStats(stats);
    }
  }, [isInitialized, dbError, getDatabaseStats]);

  const loadDataForDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!db) return;

      setIsLoadingData(true);
      try {
        const range: DateRange = { start: startDate, end: endDate };
        setDateRange(range);

        // Calculate metrics and prepare chart data
        const newMetrics = await calculateMetrics(db, range);
        const newChartData = await prepareChartData(db, range);

        setMetrics(newMetrics);
        setChartData(newChartData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoadingData(false);
      }
    },
    [db]
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      // Validate the data
      const validatedData = validateSessionData(jsonData);

      // Load into database
      const count = await loadSessionsFromJSON(validatedData);

      // Update stats
      const stats = getDatabaseStats();
      setDbStats(stats);

      // Clear existing data views to force reload
      setMetrics(null);
      setChartData(null);
      setDateRange(null);

      alert(`Successfully loaded ${count} sessions`);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to load file");
      console.error(err);
    } finally {
      setIsUploading(false);
      // Clear the input
      event.target.value = "";
    }
  };

  const handleClearDatabase = () => {
    if (confirm("Are you sure you want to clear all data?")) {
      clearDatabase();
      setDbStats({ totalSessions: 0, dateRange: { min: "", max: "" } });
      setMetrics(null);
      setChartData(null);
      setDateRange(null);
    }
  };

  const handleExportCSV = () => {
    if (!db || !dateRange) return;

    const csv = exportToCSV(db, dateRange);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `livegraphs_${dateRange.start.toISOString().split("T")[0]}_to_${dateRange.end.toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Logo size={48} className="text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Notso AI Dashboard</h1>
        </div>

        {/* Database Status */}
        {!isInitialized && !dbError && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-700">Initializing database...</p>
          </div>
        )}

        {dbError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-700">Database error: {dbError}</p>
          </div>
        )}

        {/* Upload Section */}
        {isInitialized && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload Data</h2>
            <div className="flex items-center gap-4">
              <label className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded cursor-pointer">
                Upload JSON File
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {isUploading && <span className="text-gray-600">Processing...</span>}
              {dbStats && dbStats.totalSessions > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleClearDatabase}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded"
                  >
                    Clear Database
                  </button>
                  {dateRange && (
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                    >
                      Export CSV
                    </button>
                  )}
                </>
              )}
            </div>
            {uploadError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Database Stats */}
        {dbStats && isInitialized && dbStats.totalSessions > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Database Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded">
                <div className="text-sm text-gray-600">Total Sessions</div>
                <div className="text-2xl font-bold text-blue-600">{dbStats.totalSessions}</div>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <div className="text-sm text-gray-600">Data Start Date</div>
                <div className="text-lg font-semibold text-green-600">
                  {dbStats.dateRange.min
                    ? new Date(dbStats.dateRange.min).toLocaleDateString()
                    : "No data"}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <div className="text-sm text-gray-600">Data End Date</div>
                <div className="text-lg font-semibold text-purple-600">
                  {dbStats.dateRange.max
                    ? new Date(dbStats.dateRange.max).toLocaleDateString()
                    : "No data"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Date Range Picker */}
        {dbStats && dbStats.totalSessions > 0 && (
          <DateRangePicker
            minDate={dbStats.dateRange.min}
            maxDate={dbStats.dateRange.max}
            onDateRangeChange={loadDataForDateRange}
          />
        )}

        {/* Metrics */}
        {metrics && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Metrics</h2>
            {isLoadingData ? (
              <p className="text-gray-600">Loading metrics...</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded">
                    <div className="text-sm text-gray-600">{key}</div>
                    <div className="text-xl font-semibold text-gray-800">
                      {typeof value === "number" ? value.toLocaleString() : value}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Charts Dashboard */}
        {chartData && !isLoadingData && (
          <>
            {/* Primary Insights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <AnalyticsChart
                type="doughnut"
                title="Sentiment Distribution"
                data={{
                  labels: chartData.sentiment_labels,
                  datasets: [
                    {
                      label: "Sessions",
                      data: chartData.sentiment_values,
                      backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"]
                    }
                  ]
                }}
              />
              <AnalyticsChart
                type="doughnut"
                title="Resolution Status"
                data={{
                  labels: chartData.resolution_labels,
                  datasets: [
                    {
                      label: "Sessions",
                      data: chartData.resolution_values,
                      backgroundColor: ["#10B981", "#EF4444", "#F59E0B"]
                    }
                  ]
                }}
              />
              <GaugeChart value={chartData.avg_rating} title="Average User Rating" />
            </div>

            {/* Time Series Analysis */}
            <div className="mb-8">
              <MultiLineChart
                title="Performance Trends Over Time"
                labels={chartData.dates_labels}
                datasets={[
                  {
                    label: "Sessions",
                    data: chartData.dates_values,
                    borderColor: "#3B82F6",
                    backgroundColor: "#3B82F640",
                    fill: true
                  },
                  {
                    label: "Avg Response Time (sec)",
                    data: chartData.response_time_values,
                    borderColor: "#F59E0B",
                    yAxisID: "y1"
                  }
                ]}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: "index" as const,
                    intersect: false
                  },
                  scales: {
                    x: {
                      grid: {
                        display: false
                      }
                    },
                    y: {
                      type: "linear" as const,
                      display: true,
                      position: "left" as const,
                      title: {
                        display: true,
                        text: "Number of Sessions"
                      }
                    },
                    y1: {
                      type: "linear" as const,
                      display: true,
                      position: "right" as const,
                      title: {
                        display: true,
                        text: "Response Time (sec)"
                      },
                      grid: {
                        drawOnChartArea: false
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Usage Patterns */}
            <div className="mb-8">
              <InteractiveHeatmap data={chartData.hourly_data} title="Weekly Usage Heatmap" />
            </div>

            {/* Geographic & Language Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnalyticsChart
                type="bar"
                title="Sessions by Country"
                data={{
                  labels: chartData.country_labels,
                  datasets: [
                    {
                      label: "Sessions",
                      data: chartData.country_values,
                      backgroundColor: "#3B82F6"
                    }
                  ]
                }}
                options={{
                  indexAxis: "y" as const,
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }}
              />
              <AnalyticsChart
                type="bar"
                title="Language Distribution"
                data={{
                  labels: chartData.language_labels,
                  datasets: [
                    {
                      label: "Sessions",
                      data: chartData.language_values,
                      backgroundColor: "#10B981"
                    }
                  ]
                }}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>

            {/* Category Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <AnalyticsChart
                type="bar"
                title="Top Categories"
                data={{
                  labels: chartData.category_labels.slice(0, 8),
                  datasets: [
                    {
                      label: "Sessions",
                      data: chartData.category_values.slice(0, 8),
                      backgroundColor: "#8B5CF6"
                    }
                  ]
                }}
                options={{
                  indexAxis: "y" as const,
                  scales: {
                    x: {
                      beginAtZero: true
                    }
                  }
                }}
              />
              <BubbleChart data={chartData.category_costs} title="Cost Analysis by Category" />
            </div>

            {/* Performance Distributions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <HistogramChart
                data={chartData.conversation_durations}
                title="Conversation Duration Distribution"
                xLabel="Duration (minutes)"
                bins={15}
                color="#14B8A6"
              />
              <HistogramChart
                data={chartData.messages_per_conversation}
                title="Messages per Conversation"
                xLabel="Number of Messages"
                bins={10}
                color="#EC4899"
              />
            </div>

            {/* Cost Analysis */}
            <div className="mb-8">
              <MultiLineChart
                title="Daily Cost Trend"
                labels={chartData.cost_dates}
                datasets={[
                  {
                    label: "Daily Cost (€)",
                    data: chartData.cost_values,
                    borderColor: "#F59E0B",
                    backgroundColor: "#F59E0B40",
                    fill: true
                  }
                ]}
                options={{
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `€${Number(value).toFixed(2)}`
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Top Questions */}
            {chartData.questions_labels.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top Questions</h3>
                <div className="space-y-3">
                  {chartData.questions_labels.map((question, index) => (
                    <div
                      key={`question-${index}-${question.slice(0, 20)}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <span className="text-gray-700 flex-1 mr-4">{question}</span>
                      <span className="text-gray-600 font-semibold whitespace-nowrap">
                        {chartData.questions_values[index]} times
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {(!dbStats || dbStats.totalSessions === 0) && isInitialized && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Get Started</h2>
            <p className="text-gray-600">Upload a JSON file to start analyzing your chat data.</p>
          </div>
        )}
      </div>
    </main>
  );
}
