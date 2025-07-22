import { beforeEach, describe, expect, it, vi } from "vitest";
import { calculateMetrics, exportToCSV, prepareChartData } from "../../lib/dataProcessor";
import type { DateRange } from "../../lib/types/session";

interface SqlDatabase {
  prepare(sql: string): {
    bind(values: unknown[]): void;
    step(): boolean;
    getAsObject(): Record<string, unknown>;
    free(): void;
  };
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
}

vi.mock("sql.js");

describe("dataProcessor", () => {
  let mockDb: SqlDatabase;
  let mockStmt: {
    bind: ReturnType<typeof vi.fn>;
    step: ReturnType<typeof vi.fn>;
    getAsObject: ReturnType<typeof vi.fn>;
    free: ReturnType<typeof vi.fn>;
  };
  let mockPrepare: ReturnType<typeof vi.fn>;
  const mockDateRange: DateRange = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-31")
  };

  beforeEach(() => {
    mockStmt = {
      bind: vi.fn(),
      step: vi.fn(),
      getAsObject: vi.fn(),
      free: vi.fn()
    };

    mockPrepare = vi.fn(() => mockStmt);
    mockDb = {
      prepare: mockPrepare,
      exec: vi.fn(() => [])
    } as SqlDatabase;
  });

  describe("calculateMetrics", () => {
    it("should calculate metrics correctly when data exists", async () => {
      mockStmt.step.mockReturnValueOnce(true).mockReturnValueOnce(true);
      mockStmt.getAsObject
        .mockReturnValueOnce({
          total_conversations: 100,
          unique_users: 50,
          avg_conversation_minutes: 5.5,
          avg_response_seconds: 2.3,
          resolved_percentage: 85.5,
          avg_daily_cost: 12.34
        })
        .mockReturnValueOnce({
          hour: "14:00"
        });

      const result = await calculateMetrics(mockDb, mockDateRange);

      expect(result).toEqual({
        "Total Conversations": 100,
        "Unique Users": 50,
        "Avg. Conversation Length (min)": 5.5,
        "Avg. Response Time (sec)": 2.3,
        "Resolved Chats (%)": 85.5,
        "Average Daily Cost (€)": 12.34,
        "Peak Usage Time": "14:00"
      });

      expect(mockDb.prepare).toHaveBeenCalledTimes(2);
      expect(mockStmt.bind).toHaveBeenCalledWith([
        mockDateRange.start.toISOString(),
        mockDateRange.end.toISOString()
      ]);
    });

    it("should handle empty data gracefully", async () => {
      mockStmt.step.mockReturnValueOnce(true).mockReturnValueOnce(false);
      mockStmt.getAsObject.mockReturnValueOnce(null).mockReturnValueOnce(null);

      const result = await calculateMetrics(mockDb, mockDateRange);

      expect(result).toEqual({
        "Total Conversations": 0,
        "Unique Users": 0,
        "Avg. Conversation Length (min)": 0,
        "Avg. Response Time (sec)": 0,
        "Resolved Chats (%)": 0,
        "Average Daily Cost (€)": 0,
        "Peak Usage Time": "N/A"
      });
    });

    it("should handle database errors", async () => {
      mockPrepare.mockImplementationOnce(() => {
        throw new Error("Database error");
      });

      await expect(calculateMetrics(mockDb, mockDateRange)).rejects.toThrow("Database error");
    });
  });

  describe("prepareChartData", () => {
    beforeEach(() => {
      // Setup mock to return empty arrays by default
      mockStmt.step.mockReturnValue(false);
    });

    it("should prepare all chart data correctly", async () => {
      // Mock sentiment data
      const mockSentimentData = [
        { sentiment: "positive", count: 30 },
        { sentiment: "neutral", count: 50 },
        { sentiment: "negative", count: 20 }
      ];

      let queryIndex = 0;
      mockPrepare.mockImplementation(() => {
        const stmt = {
          bind: vi.fn(),
          step: vi.fn(),
          getAsObject: vi.fn(),
          free: vi.fn()
        };

        // Return data for sentiment query only (first query)
        if (queryIndex === 0) {
          let stepCount = 0;
          stmt.step.mockImplementation(() => {
            return stepCount++ < mockSentimentData.length;
          });

          let dataIndex = 0;
          stmt.getAsObject.mockImplementation(() => {
            return mockSentimentData[dataIndex++];
          });
        } else {
          stmt.step.mockReturnValue(false);
        }

        queryIndex++;
        return stmt;
      });

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result).toHaveProperty("sentiment_labels");
      expect(result.sentiment_labels).toEqual(["Positive", "Neutral", "Negative"]);
      expect(result.sentiment_values).toEqual([30, 50, 20]);

      // Verify other properties exist even if empty
      expect(result).toHaveProperty("resolution_labels");
      expect(result).toHaveProperty("category_labels");
      expect(result).toHaveProperty("questions_labels");
      expect(result).toHaveProperty("dates_labels");
      expect(result).toHaveProperty("hourly_data");
      expect(result).toHaveProperty("avg_rating");
    });

    it("should handle empty chart data", async () => {
      mockStmt.step.mockReturnValue(false);

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.sentiment_labels).toEqual([]);
      expect(result.sentiment_values).toEqual([]);
      expect(result.avg_rating).toBeNull();
    });

    it("should truncate long question text", async () => {
      const longQuestion =
        "This is a very long question that exceeds the maximum length limit and should be truncated";

      let queryIndex = 0;
      mockPrepare.mockImplementation(() => {
        const stmt = {
          bind: vi.fn(),
          step: vi.fn(),
          getAsObject: vi.fn(),
          free: vi.fn()
        };

        // Return data for questions query (4th query)
        if (queryIndex === 3) {
          let stepCount = 0;
          stmt.step.mockImplementation(() => stepCount++ < 1);
          stmt.getAsObject.mockReturnValue({ question: longQuestion, count: 10 });
        } else {
          stmt.step.mockReturnValue(false);
        }

        queryIndex++;
        return stmt;
      });

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.questions_labels[0]).toHaveLength(50);
      expect(result.questions_labels[0]).toContain("...");
    });
  });

  describe("exportToCSV", () => {
    it("should export data to CSV format", () => {
      const mockData = [
        {
          session_id: "123",
          start_time: "2024-01-01 10:00:00",
          end_time: "2024-01-01 10:30:00",
          ip_address: "hash123",
          country: "USA",
          language: "en",
          messages_sent: 10,
          sentiment: "positive",
          escalated: "No",
          forwarded_hr: "No",
          chat_transcript_link: "http://example.com",
          average_response_time: 2.5,
          tokens: 500,
          tokens_eur: 0.0125,
          question_category: "Technical",
          asked_question: "",
          user_rating: 5,
          time_interval: "10:00",
          date_interval: "2024-01-01"
        }
      ];

      let stepCount = 0;
      mockStmt.step.mockImplementation(() => stepCount++ < mockData.length);
      mockStmt.getAsObject.mockImplementation(() => mockData[0]);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain("session_id,start_time,end_time");
      expect(result).toContain("123,2024-01-01 10:00:00,2024-01-01 10:30:00");
      expect(result).toContain("Technical");
      expect(mockStmt.bind).toHaveBeenCalledWith([
        mockDateRange.start.toISOString(),
        mockDateRange.end.toISOString()
      ]);
    });

    it("should handle CSV values with commas", () => {
      const mockData = [
        {
          session_id: "123",
          question_category: "Technical, Support",
          sentiment: "positive"
        }
      ];

      let stepCount = 0;
      mockStmt.step.mockImplementation(() => stepCount++ < 1);
      mockStmt.getAsObject.mockReturnValue(mockData[0]);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain('"Technical, Support"');
    });

    it("should return empty string when no data", () => {
      mockStmt.step.mockReturnValue(false);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toBe("");
    });

    it("should handle null values", () => {
      const mockData = [
        {
          session_id: "123",
          user_rating: null,
          question_category: undefined
        }
      ];

      let stepCount = 0;
      mockStmt.step.mockImplementation(() => stepCount++ < 1);
      mockStmt.getAsObject.mockReturnValue(mockData[0]);

      const result = exportToCSV(mockDb, mockDateRange);

      expect(result).toContain("123,,");
    });
  });

  describe("Helper functions", () => {
    it("should capitalize first letter correctly", async () => {
      const mockData = [
        { sentiment: "positive", count: 10 },
        { sentiment: "NEGATIVE", count: 5 }
      ];

      let queryIndex = 0;
      mockPrepare.mockImplementation(() => {
        const stmt = {
          bind: vi.fn(),
          step: vi.fn(),
          getAsObject: vi.fn(),
          free: vi.fn()
        };

        if (queryIndex === 0) {
          let stepCount = 0;
          let dataIndex = 0;
          stmt.step.mockImplementation(() => stepCount++ < mockData.length);
          stmt.getAsObject.mockImplementation(() => mockData[dataIndex++]);
        } else {
          stmt.step.mockReturnValue(false);
        }

        queryIndex++;
        return stmt;
      });

      const result = await prepareChartData(mockDb, mockDateRange);

      expect(result.sentiment_labels).toEqual(["Positive", "Negative"]);
    });
  });
});
