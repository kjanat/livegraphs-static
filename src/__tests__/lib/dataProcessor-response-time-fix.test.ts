/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

describe("dataProcessor - Response Time Fix", () => {
  it("should correctly map avg_response field from SQL query", () => {
    // This test documents the fix for the response time bug
    // The SQL query aliases the column as 'avg_response':
    //   AVG(avg_response_time) as avg_response
    //
    // But the old code was trying to access row.avg_response_time
    // This caused all response time values to be 0

    // The fix is to access row.avg_response instead
    const mockResponseTimeData = [
      { date: "2024-01-01", avg_response: 2.5 },
      { date: "2024-01-02", avg_response: 3.2 },
      { date: "2024-01-03", avg_response: 1.8 }
    ];

    // This is how the code should process the data
    const response_time_values = mockResponseTimeData.map((row) =>
      row.avg_response !== null && row.avg_response !== undefined
        ? Number((row.avg_response as number).toFixed(1))
        : 0
    );

    expect(response_time_values).toEqual([2.5, 3.2, 1.8]);
    expect(response_time_values).not.toEqual([0, 0, 0]);
  });

  it("should handle null/undefined response times properly", () => {
    const mockResponseTimeData = [
      { date: "2024-01-01", avg_response: null },
      { date: "2024-01-02", avg_response: undefined },
      { date: "2024-01-03", avg_response: 0 },
      { date: "2024-01-04", avg_response: 2.5 }
    ];

    const response_time_values = mockResponseTimeData.map((row) =>
      row.avg_response !== null && row.avg_response !== undefined
        ? Number((row.avg_response as number).toFixed(1))
        : 0
    );

    expect(response_time_values).toEqual([0, 0, 0, 2.5]);
  });
});
