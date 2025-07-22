import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateMetrics, exportToCSV, prepareChartData } from "../../lib/dataProcessor";
import type { Database } from "../../lib/db/sql-wrapper";
import type { DateRange } from "../../lib/types/session";

// Mock the sql-wrapper functions
vi.mock("../../lib/db/sql-wrapper", () => ({
  queryOne: vi.fn(),
  executeQuery: vi.fn()
}));

describe("dataProcessor", () => {
  let mockDb: Database;
  const mockDateRange: DateRange = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-31")
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a mock database object
    mockDb = {
      prepare: vi.fn(() => ({
        bind: vi.fn(),
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn(),
        free: vi.fn(),
        run: vi.fn()
      })),
      run: vi.fn(),
      exec: vi.fn(() => []),
      export: vi.fn(() => new Uint8Array()),
      close: vi.fn(),
      getRowsModified: vi.fn().mockReturnValue(0)
    } as Database;
  });

  describe("calculateMetrics", () => {
    it("should calculate metrics correctly when data exists", async () => {
      const { queryOne } = await import("../../lib/db/sql-wrapper");

      // Mock the two queries made by calculateMetrics
      vi.mocked(queryOne)
        .mockReturnValueOnce({
          total_conversations: 100,
          unique_users: 50,
          avg_conversation_minutes: 5.5,
          avg_response_seconds: 2.3,
          resolved_percentage: 85.5,
          avg_daily_cost: 12.34,
          avg_user_rating: null
        })
        .mockReturnValueOnce({
          hour: "14:00",
          count: 25
        });

      const result = await calculateMetrics(mockDb, mockDateRange);

      expect(result).toEqual({
        "Total Conversations": 100,
        "Unique Users": 50,
        "Avg. Conversation Length (min)": 5.5,
        "Avg. Response Time (sec)": 2.3,
        "Resolved Chats (%)": 85.5,
        "Average Daily Cost (€)": 12.34,
        "Peak Usage Time": "14:00",
        "Avg. User Rating": "N/A"
      });

      expect(queryOne).toHaveBeenCalledTimes(2);
    });

    it("should handle empty data gracefully", async () => {
      const { queryOne } = await import("../../lib/db/sql-wrapper");
      vi.mocked(queryOne).mockReturnValue(null);

      const result = await calculateMetrics(mockDb, mockDateRange);

      expect(result["Total Conversations"]).toBe(0);
      expect(result["Peak Usage Time"]).toBe("N/A");
    });

    it("should handle database errors", async () => {
      const { queryOne } = await import("../../lib/db/sql-wrapper");
      vi.mocked(queryOne).mockImplementation(() => {
        throw new Error("Database error");
      });

      await expect(calculateMetrics(mockDb, mockDateRange)).rejects.toThrow("Database error");
    });
  });

  describe("prepareChartData", () => {
    it("should prepare all chart data correctly", async () => {
      const { executeQuery } = await import("../../lib/db/sql-wrapper");

      // Mock all the queries made by prepareChartData
      vi.mocked(executeQuery)
        // Sentiment data
        .mockReturnValueOnce([
          { sentiment: "positive", count: 50 },
          { sentiment: "negative", count: 30 }
        ])
        // Resolution data
        .mockReturnValueOnce([
          { status: "Resolved", count: 70 },
          { status: "Escalated", count: 30 }
        ])
        // Category data
        .mockReturnValueOnce([
          { category: "Technical", count: 40 },
          { category: "Billing", count: 20 }
        ])
        // Questions data
        .mockReturnValueOnce([{ question: "How to reset password?", count: 15 }])
        // Time series data
        .mockReturnValueOnce([
          { date: "2024-01-01", count: 10 },
          { date: "2024-01-02", count: 15 }
        ])
        // Response time data
        .mockReturnValueOnce([{ date: "2024-01-01", avg_response: 2.5 }])
        // Cost data
        .mockReturnValueOnce([{ date: "2024-01-01", daily_cost: 10.5 }])
        // Country data
        .mockReturnValueOnce([{ country: "USA", count: 50 }])
        // Language data
        .mockReturnValueOnce([{ language: "en", count: 80 }])
        // Heatmap data
        .mockReturnValueOnce([{ hour: 14, day_of_week: "1", count: 25 }])
        // Duration data
        .mockReturnValueOnce([{ duration_minutes: 5.5 }])
        // Messages data
        .mockReturnValueOnce([{ total_messages: 10 }])
        // Rating distribution
        .mockReturnValueOnce([{ user_rating: 5, count: 20 }])
        // Average rating
        .mockReturnValueOnce([{ avg_rating: 4.5 }])
        // Category costs
        .mockReturnValueOnce([
          { category: "Technical", total_cost: 100.5, avg_cost: 2.5, count: 40 }
        ]);

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.sentiment_labels).toEqual(["Positive", "Negative"]);
      expect(result.sentiment_values).toEqual([50, 30]);
      expect(result.resolution_labels).toEqual(["Resolved", "Escalated"]);
      expect(result.avg_rating).toBe(4.5);
    });

    it("should handle empty chart data", async () => {
      const { executeQuery } = await import("../../lib/db/sql-wrapper");
      vi.mocked(executeQuery).mockReturnValue([]);

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.sentiment_labels).toEqual([]);
      expect(result.sentiment_values).toEqual([]);
      expect(result.avg_rating).toBeNull();
    });

    it("should truncate long question text", async () => {
      const { executeQuery } = await import("../../lib/db/sql-wrapper");

      const longQuestion =
        "This is a very long question that should be truncated because it exceeds the maximum length allowed";

      vi.mocked(executeQuery)
        .mockReturnValue([])
        .mockReturnValueOnce([]) // sentiment
        .mockReturnValueOnce([]) // resolution
        .mockReturnValueOnce([]) // category
        .mockReturnValueOnce([{ question: longQuestion, count: 5 }]); // questions

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.questions_labels[0]).toHaveLength(50); // maxLength including "..."
      expect(result.questions_labels[0]).toMatch(/\.\.\.$/);
    });
  });

  describe("exportToCSV", () => {
    it("should export data to CSV format", () => {
      const mockStmt = {
        bind: vi.fn(),
        step: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        getAsObject: vi.fn().mockReturnValue({
          session_id: "123",
          start_time: "2024-01-01T10:00:00Z",
          sentiment: "positive"
        }),
        free: vi.fn()
      };

      mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain("session_id,start_time,sentiment");
      expect(result).toContain("123,2024-01-01T10:00:00Z,positive");
    });

    it("should handle CSV values with commas", () => {
      const mockStmt = {
        bind: vi.fn(),
        step: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        getAsObject: vi.fn().mockReturnValue({
          session_id: "123",
          summary: "Hello, world"
        }),
        free: vi.fn()
      };

      mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain('"Hello, world"');
    });

    it("should return empty string when no data", () => {
      const mockStmt = {
        bind: vi.fn(),
        step: vi.fn().mockReturnValue(false),
        getAsObject: vi.fn(),
        free: vi.fn()
      };

      mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toBe("");
    });

    it("should handle null values", () => {
      const mockStmt = {
        bind: vi.fn(),
        step: vi.fn().mockReturnValueOnce(true).mockReturnValueOnce(false),
        getAsObject: vi.fn().mockReturnValue({
          session_id: "123",
          user_rating: null
        }),
        free: vi.fn()
      };

      mockDb.prepare = vi.fn().mockReturnValue(mockStmt);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain("123,");
      expect(result).not.toContain("null");
    });
  });

  describe("Helper functions", () => {
    it("should capitalize first letter correctly", async () => {
      const { executeQuery } = await import("../../lib/db/sql-wrapper");

      vi.mocked(executeQuery)
        .mockReturnValueOnce([
          { sentiment: "positive", count: 1 },
          { sentiment: "NEGATIVE", count: 1 },
          { sentiment: "neutral", count: 1 }
        ])
        .mockReturnValue([]);

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.sentiment_labels).toEqual(["Positive", "Negative", "Neutral"]);
    });
  });
});
