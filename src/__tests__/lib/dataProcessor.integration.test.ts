/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateMetrics, exportToCSV, prepareChartData } from "@/lib/dataProcessor";
// Import Database type from sql-wrapper
import type { Database, Statement } from "@/lib/db/sql-wrapper";
import type { DateRange } from "@/lib/types/session";

// Helper function to create mock statements
const createMockStatement = (overrides?: Partial<Statement>): Statement => ({
  bind: vi.fn(),
  step: vi.fn().mockReturnValue(false),
  getAsObject: vi.fn().mockReturnValue({}),
  free: vi.fn(),
  run: vi.fn(),
  ...overrides
});

// Create typed mock functions
const mockPrepare = vi.fn<(sql: string) => Statement>();
const mockExec = vi.fn<(sql: string) => Array<{ columns: string[]; values: unknown[][] }>>();
const mockRun = vi.fn<(sql: string) => void>();
const mockExport = vi.fn<() => Uint8Array>();
const mockClose = vi.fn<() => void>();
const mockGetRowsModified = vi.fn<() => number>();

// Mock SQL.js database
const mockDatabase: Database = {
  prepare: mockPrepare,
  exec: mockExec,
  run: mockRun,
  export: mockExport,
  close: mockClose,
  getRowsModified: mockGetRowsModified
};

describe("DataProcessor Integration Tests", () => {
  const mockDateRange: DateRange = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-31")
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize mock return values
    mockExport.mockReturnValue(new Uint8Array([1, 2, 3]));
    mockGetRowsModified.mockReturnValue(0);
  });

  describe("calculateMetrics", () => {
    it("should handle empty database gracefully", async () => {
      const mockStmt = createMockStatement({
        step: vi.fn().mockReturnValue(true),
        getAsObject: vi.fn().mockReturnValue({
          total_conversations: null,
          unique_users: null,
          avg_conversation_minutes: null,
          avg_response_seconds: null,
          resolved_percentage: null,
          avg_daily_cost: null
        })
      });

      const mockPeakStmt = createMockStatement({
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn().mockReturnValue(null)
      });

      mockPrepare.mockReturnValueOnce(mockStmt).mockReturnValueOnce(mockPeakStmt);

      const metrics = await calculateMetrics(mockDatabase, mockDateRange);

      expect(metrics["Total Conversations"]).toBe(0);
      expect(metrics["Unique Users"]).toBe(0);
      expect(metrics["Peak Usage Time"]).toBe("N/A");
    });

    it("should calculate metrics correctly with data", async () => {
      const mockMetricsStmt = createMockStatement({
        step: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        getAsObject: vi.fn().mockReturnValue({
          total_conversations: 100,
          unique_users: 50,
          avg_conversation_minutes: 5.5,
          avg_response_seconds: 2.3,
          resolved_percentage: 85.5,
          avg_daily_cost: 12.5
        })
      });

      const mockPeakStmt = createMockStatement({
        step: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        getAsObject: vi.fn().mockReturnValue({
          hour: "14:00",
          count: 25
        })
      });

      mockPrepare.mockReturnValueOnce(mockMetricsStmt).mockReturnValueOnce(mockPeakStmt);

      const metrics = await calculateMetrics(mockDatabase, mockDateRange);

      expect(metrics["Total Conversations"]).toBe(100);
      expect(metrics["Unique Users"]).toBe(50);
      expect(metrics["Avg. Conversation Length (min)"]).toBe(5.5);
      expect(metrics["Avg. Response Time (sec)"]).toBe(2.3);
      expect(metrics["Resolved Chats (%)"]).toBe(85.5);
      expect(metrics["Average Daily Cost (€)"]).toBe(12.5);
      expect(metrics["Peak Usage Time"]).toBe("14:00");
    });

    it("should handle database errors gracefully", async () => {
      mockPrepare.mockImplementation(() => {
        throw new Error("Database connection failed");
      });

      await expect(calculateMetrics(mockDatabase, mockDateRange)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("prepareChartData", () => {
    it("should handle missing data fields gracefully", async () => {
      const mockStmt = createMockStatement({
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn().mockReturnValue({})
      });

      mockPrepare.mockReturnValue(mockStmt);

      const chartData = await prepareChartData(mockDatabase, mockDateRange);

      expect(chartData.sentiment_labels).toEqual([]);
      expect(chartData.sentiment_values).toEqual([]);
      expect(chartData.avg_rating).toBeNull();
    });

    it("should sanitize user-generated content", async () => {
      const mockQuestionStmt = createMockStatement({
        step: vi
          .fn()
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false),
        getAsObject: vi
          .fn()
          .mockReturnValueOnce({
            question: "<script>alert('XSS')</script>How to reset password?",
            count: 10
          })
          .mockReturnValueOnce({
            question:
              "Very long question that exceeds the maximum allowed length and should be truncated properly",
            count: 5
          })
      });

      // Mock other required queries to return empty
      const emptyStmt = createMockStatement({
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn().mockReturnValue({})
      });

      mockPrepare.mockImplementation((sql: string) => {
        if (sql.includes("question,")) {
          return mockQuestionStmt;
        }
        return emptyStmt;
      });

      const chartData = await prepareChartData(mockDatabase, mockDateRange);

      // Should escape HTML and truncate
      expect(chartData.questions_labels[0]).not.toContain("<script>");
      expect(chartData.questions_labels[1].length).toBeLessThanOrEqual(53); // 50 + "..."
    });
  });

  describe("exportToCSV", () => {
    it("should export valid CSV with proper escaping", () => {
      const mockStmt = createMockStatement({
        step: vi
          .fn()
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false),
        getAsObject: vi
          .fn()
          .mockReturnValueOnce({
            session_id: "123",
            start_time: "2024-01-01T10:00:00",
            sentiment: "positive",
            category: "Technical, Support", // Contains comma
            tokens_eur: 0.0025
          })
          .mockReturnValueOnce({
            session_id: "124",
            start_time: "2024-01-01T11:00:00",
            sentiment: "negative",
            category: 'Category with "quotes"', // Contains quotes
            tokens_eur: 0.003
          })
      });

      mockPrepare.mockReturnValue(mockStmt);

      const csv = exportToCSV(mockDatabase, mockDateRange);

      expect(csv).toContain("session_id,start_time,");
      expect(csv).toContain('"Technical, Support"'); // Properly quoted
      expect(csv).toContain('"Category with ""quotes"""'); // Escaped quotes
    });

    it("should handle empty result set", () => {
      const mockStmt = createMockStatement({
        step: vi.fn().mockReturnValue(false)
      });

      mockPrepare.mockReturnValue(mockStmt);

      const csv = exportToCSV(mockDatabase, mockDateRange);

      expect(csv).toBe("");
    });
  });

  describe("Performance Tests", () => {
    it("should handle large datasets efficiently", async () => {
      const largeDatasetStmt = createMockStatement({
        step: vi.fn(),
        getAsObject: vi.fn()
      });

      // Simulate 10,000 records
      let callCount = 0;
      (largeDatasetStmt.step as any).mockImplementation(() => {
        return ++callCount <= 10000;
      });

      (largeDatasetStmt.getAsObject as any).mockImplementation(() => ({
        sentiment: callCount % 3 === 0 ? "positive" : callCount % 3 === 1 ? "negative" : "neutral",
        count: Math.floor(Math.random() * 100)
      }));

      mockPrepare.mockReturnValue(largeDatasetStmt);

      const startTime = performance.now();
      await prepareChartData(mockDatabase, mockDateRange);
      const endTime = performance.now();

      // Should process 10k records in under 1 second
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
