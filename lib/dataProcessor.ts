/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { ChartData, DateRange, Metrics } from "./types/session";

interface Statement {
  bind(values: unknown[]): void;
  step(): boolean;
  getAsObject(): Record<string, unknown>;
  free(): void;
}

interface SqlDatabase {
  prepare(sql: string): Statement;
  exec(sql: string): Array<{ columns: string[]; values: unknown[][] }>;
}

// Type guards for safer type assertions
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !Number.isNaN(value);
}

function safeString(value: unknown, defaultValue = ""): string {
  return isString(value) ? value : defaultValue;
}

function safeNumber(value: unknown, defaultValue = 0): number {
  return isNumber(value) ? value : defaultValue;
}

export async function calculateMetrics(db: SqlDatabase, dateRange: DateRange): Promise<Metrics> {
  // Get basic metrics
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_conversations,
      COUNT(DISTINCT ip_hash) as unique_users,
      AVG(conversation_duration_seconds) / 60.0 as avg_conversation_minutes,
      AVG(avg_response_time) as avg_response_seconds,
      SUM(CASE WHEN escalated = 0 AND forwarded_hr = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as resolved_percentage,
      SUM(cost_eur_cents) / 100.0 / COUNT(DISTINCT DATE(start_time)) as avg_daily_cost,
      AVG(user_rating) as avg_user_rating
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
  `);
  stmt.bind([dateRange.start.toISOString(), dateRange.end.toISOString()]);
  stmt.step();
  const metricsRow = stmt.getAsObject();
  stmt.free();

  const metrics = metricsRow
    ? [
        metricsRow.total_conversations ?? 0,
        metricsRow.unique_users ?? 0,
        metricsRow.avg_conversation_minutes ?? 0,
        metricsRow.avg_response_seconds ?? 0,
        metricsRow.resolved_percentage ?? 0,
        metricsRow.avg_daily_cost ?? 0,
        metricsRow.avg_user_rating ?? null
      ]
    : [0, 0, 0, 0, 0, 0, null];

  // Get peak usage time
  const peakStmt = db.prepare(`
    SELECT 
      strftime('%H:00', start_time) as hour,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY hour
    ORDER BY count DESC
    LIMIT 1
  `);
  peakStmt.bind([dateRange.start.toISOString(), dateRange.end.toISOString()]);
  peakStmt.step();
  const peakRow = peakStmt.getAsObject();
  peakStmt.free();

  const peakHour = peakRow?.hour || "N/A";

  const avgRating = metrics[6];
  const formattedRating =
    avgRating !== null && isNumber(avgRating) ? Number(avgRating.toFixed(1)) : "N/A";

  return {
    "Total Conversations": Math.round(metrics[0] as number),
    "Unique Users": Math.round(metrics[1] as number),
    "Avg. Conversation Length (min)": Number(((metrics[2] as number) || 0).toFixed(1)),
    "Avg. Response Time (sec)": Number(((metrics[3] as number) || 0).toFixed(1)),
    "Resolved Chats (%)": Number(((metrics[4] as number) || 0).toFixed(1)),
    "Average Daily Cost (€)": Number(((metrics[5] as number) || 0).toFixed(2)),
    "Peak Usage Time": peakHour as string,
    "Avg. User Rating": formattedRating
  };
}

export async function prepareChartData(db: SqlDatabase, dateRange: DateRange): Promise<ChartData> {
  const startStr = dateRange.start.toISOString();
  const endStr = dateRange.end.toISOString();

  // Helper function to execute query and get results
  function executeQuery(sql: string): Array<Record<string, unknown>> {
    const stmt = db.prepare(sql);
    stmt.bind([startStr, endStr]);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  // Sentiment data
  const sentimentData = executeQuery(`
    SELECT sentiment, COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY sentiment
  `);

  const sentiment_labels = sentimentData.map((row) => capitalizeFirst(safeString(row.sentiment)));
  const sentiment_values = sentimentData.map((row) => safeNumber(row.count));

  // Resolution data
  const resolutionData = executeQuery(`
    SELECT 
      CASE 
        WHEN escalated = 1 THEN 'Escalated'
        WHEN forwarded_hr = 1 THEN 'Forwarded to HR'
        ELSE 'Resolved'
      END as status,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY status
  `);

  const resolution_labels = resolutionData.map((row) => safeString(row.status));
  const resolution_values = resolutionData.map((row) => safeNumber(row.count));

  // Category data
  const categoryData = executeQuery(`
    SELECT category, COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
      AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `);

  const category_labels = categoryData.map((row) => safeString(row.category));
  const category_values = categoryData.map((row) => safeNumber(row.count));

  // Top questions
  const questionsData = executeQuery(`
    SELECT question, COUNT(*) as count
    FROM questions q
    JOIN sessions s ON q.session_id = s.session_id
    WHERE datetime(s.start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY question
    ORDER BY count DESC
    LIMIT 5
  `);

  const questions_labels = questionsData.map((row) => {
    const question = safeString(row.question);
    const escaped = question.replace(/[<>]/g, ""); // Remove HTML tags
    return truncateText(escaped, 50);
  });
  const questions_values = questionsData.map((row) => row.count as number);

  // Time series data
  const timeData = executeQuery(`
    SELECT 
      DATE(start_time) as date,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY date
    ORDER BY date
  `);

  const dates_labels = timeData.map((row) => row.date as string);
  const dates_values = timeData.map((row) => row.count as number);

  // Response time over time
  const responseTimeData = executeQuery(`
    SELECT 
      DATE(start_time) as date,
      AVG(avg_response_time) as avg_response
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY date
    ORDER BY date
  `);

  const response_time_dates = responseTimeData.map((row) => row.date as string);
  const response_time_values = responseTimeData.map((row) =>
    Number((row.avg_response as number).toFixed(1))
  );

  // Cost over time
  const costData = executeQuery(`
    SELECT 
      DATE(start_time) as date,
      SUM(cost_eur_cents) / 100.0 as daily_cost
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY date
    ORDER BY date
  `);

  const cost_dates = costData.map((row) => row.date as string);
  const cost_values = costData.map((row) => Number((row.daily_cost as number).toFixed(2)));

  // Geographic distribution
  const countryData = executeQuery(`
    SELECT country, COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY country
    ORDER BY count DESC
    LIMIT 10
  `);

  const country_labels = countryData.map((row) => row.country as string);
  const country_values = countryData.map((row) => row.count as number);

  // Language distribution
  const languageData = executeQuery(`
    SELECT language, COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY language
    ORDER BY count DESC
    LIMIT 8
  `);

  const language_labels = languageData.map((row) => row.language as string);
  const language_values = languageData.map((row) => row.count as number);

  // Hourly heatmap data
  const heatmapData = executeQuery(`
    SELECT 
      CAST(strftime('%H', start_time) as INTEGER) as hour,
      strftime('%w', start_time) as day_of_week,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    GROUP BY hour, day_of_week
  `);

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hourly_data = heatmapData.map((row) => ({
    hour: row.hour as number,
    day: dayNames[parseInt(row.day_of_week as string)],
    count: row.count as number
  }));

  // Conversation durations
  const durationData = executeQuery(`
    SELECT conversation_duration_seconds / 60.0 as duration_minutes
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    ORDER BY duration_minutes
  `);

  const conversation_durations = durationData.map((row) =>
    Number((row.duration_minutes as number).toFixed(1))
  );

  // Messages per conversation
  const messagesData = executeQuery(`
    SELECT total_messages
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    ORDER BY total_messages
  `);

  const messages_per_conversation = messagesData.map((row) => row.total_messages as number);

  // Rating distribution
  const ratingData = executeQuery(`
    SELECT 
      user_rating,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
      AND user_rating IS NOT NULL
    GROUP BY user_rating
    ORDER BY user_rating
  `);

  const rating_distribution = ratingData.map((row) => ({
    rating: row.user_rating as number,
    count: row.count as number
  }));

  // Average rating
  const avgRatingData = executeQuery(`
    SELECT AVG(user_rating) as avg_rating
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
      AND user_rating IS NOT NULL
  `);

  const avg_rating =
    avgRatingData.length > 0 && avgRatingData[0].avg_rating
      ? Number((avgRatingData[0].avg_rating as number).toFixed(1))
      : null;

  // Cost by category
  const categoryCostData = executeQuery(`
    SELECT 
      category,
      SUM(cost_eur_cents) / 100.0 as total_cost,
      AVG(cost_eur_cents) / 100.0 as avg_cost,
      COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
      AND category IS NOT NULL
    GROUP BY category
    ORDER BY total_cost DESC
    LIMIT 10
  `);

  const category_costs = categoryCostData.map((row) => ({
    category: row.category as string,
    total_cost: Number((row.total_cost as number).toFixed(2)),
    avg_cost: Number((row.avg_cost as number).toFixed(4)),
    count: row.count as number
  }));

  return {
    sentiment_labels,
    sentiment_values,
    resolution_labels,
    resolution_values,
    category_labels,
    category_values,
    questions_labels,
    questions_values,
    dates_labels,
    dates_values,
    response_time_dates,
    response_time_values,
    cost_dates,
    cost_values,
    country_labels,
    country_values,
    language_labels,
    language_values,
    hourly_data,
    conversation_durations,
    messages_per_conversation,
    rating_distribution,
    avg_rating,
    category_costs
  };
}

// Helper functions
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

// Export data as CSV
export function exportToCSV(db: SqlDatabase, dateRange: DateRange): string {
  const stmt = db.prepare(`
    SELECT 
      session_id,
      start_time,
      end_time,
      ip_hash as ip_address,
      country,
      language,
      total_messages as messages_sent,
      sentiment,
      CASE WHEN escalated = 1 THEN 'Yes' ELSE 'No' END as escalated,
      CASE WHEN forwarded_hr = 1 THEN 'Yes' ELSE 'No' END as forwarded_hr,
      source_url as chat_transcript_link,
      avg_response_time as average_response_time,
      total_tokens as tokens,
      ROUND(cost_eur_cents / 100.0, 4) as tokens_eur,
      category as question_category,
      '' as asked_question,
      user_rating,
      strftime('%H:%M', start_time) as time_interval,
      DATE(start_time) as date_interval
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
    ORDER BY start_time
  `);

  stmt.bind([dateRange.start.toISOString(), dateRange.end.toISOString()]);

  const rows = [];
  const columns: string[] = [];
  let headerSet = false;

  while (stmt.step()) {
    const row = stmt.getAsObject();
    if (!headerSet) {
      columns.push(...Object.keys(row));
      headerSet = true;
    }
    rows.push(row);
  }
  stmt.free();

  if (rows.length === 0) return "";

  // Build CSV
  const headers = columns.join(",");
  const csvRows = rows.map((row) =>
    columns
      .map((col) => {
        const val = row[col];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") {
          // Quote fields that contain commas, quotes, or newlines
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
        }
        return val;
      })
      .join(",")
  );

  return [headers, ...csvRows].join("\n");
}
