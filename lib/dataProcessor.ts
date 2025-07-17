import type { ChartData, Metrics, DateRange } from './types/session';
import type { SqlJs } from 'sql.js';

export async function calculateMetrics(
  db: SqlJs.Database, 
  dateRange: DateRange
): Promise<Metrics> {

  // Get basic metrics
  const stmt = db.prepare(`
    SELECT 
      COUNT(*) as total_conversations,
      COUNT(DISTINCT ip_hash) as unique_users,
      AVG(conversation_duration_seconds) / 60.0 as avg_conversation_minutes,
      AVG(avg_response_time) as avg_response_seconds,
      SUM(CASE WHEN escalated = 0 AND forwarded_hr = 0 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as resolved_percentage,
      SUM(cost_eur_cents) / 100.0 / COUNT(DISTINCT DATE(start_time)) as avg_daily_cost
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
  `);
  stmt.bind([dateRange.start.toISOString(), dateRange.end.toISOString()]);
  stmt.step();
  const metricsRow = stmt.getAsObject();
  stmt.free();

  const metrics = metricsRow ? [
    metricsRow.total_conversations,
    metricsRow.unique_users,
    metricsRow.avg_conversation_minutes,
    metricsRow.avg_response_seconds,
    metricsRow.resolved_percentage,
    metricsRow.avg_daily_cost
  ] : [0, 0, 0, 0, 0, 0];

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

  const peakHour = peakRow?.hour || 'N/A';

  return {
    'Total Conversations': Math.round(metrics[0] as number),
    'Unique Users': Math.round(metrics[1] as number),
    'Avg. Conversation Length (min)': Number((metrics[2] as number || 0).toFixed(1)),
    'Avg. Response Time (sec)': Number((metrics[3] as number || 0).toFixed(1)),
    'Resolved Chats (%)': Number((metrics[4] as number || 0).toFixed(1)),
    'Average Daily Cost (€)': Number((metrics[5] as number || 0).toFixed(2)),
    'Peak Usage Time': peakHour as string
  };
}

export async function prepareChartData(
  db: SqlJs.Database,
  dateRange: DateRange
): Promise<ChartData> {
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

  const sentiment_labels = sentimentData.map(row => capitalizeFirst(row.sentiment as string));
  const sentiment_values = sentimentData.map(row => row.count as number);

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

  const resolution_labels = resolutionData.map(row => row.status as string);
  const resolution_values = resolutionData.map(row => row.count as number);

  // Category data
  const categoryData = executeQuery(`
    SELECT category, COUNT(*) as count
    FROM sessions
    WHERE datetime(start_time) BETWEEN datetime(?) AND datetime(?)
      AND category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `);

  const category_labels = categoryData.map(row => row.category as string);
  const category_values = categoryData.map(row => row.count as number);

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

  const questions_labels = questionsData.map(row => truncateText(row.question as string, 50));
  const questions_values = questionsData.map(row => row.count as number);

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

  const dates_labels = timeData.map(row => row.date as string);
  const dates_values = timeData.map(row => row.count as number);

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
    dates_values
  };
}

// Helper functions
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// Export data as CSV
export function exportToCSV(db: SqlJs.Database, dateRange: DateRange): string {
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

  if (rows.length === 0) return '';

  // Build CSV
  const headers = columns.join(',');
  const csvRows = rows.map(row => 
    columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return '';
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',')
  );

  return [headers, ...csvRows].join('\n');
}