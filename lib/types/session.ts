/**
 * Core types for the LiveGraphs application
 */

export interface TranscriptMessage {
  timestamp: string;
  role: "User" | "Assistant";
  content: string;
}

export interface MessageMetrics {
  response_time: {
    avg: number;
  };
  amount: {
    user: number;
    total: number;
  };
  tokens: number;
  cost: {
    eur: {
      cent: number;
      full: number;
    };
  };
  source_url: string;
}

export interface UserInfo {
  ip: string;
  country: string;
  language: string;
}

export interface ChatSession {
  session_id: string;
  start_time: string;
  end_time: string;
  transcript: TranscriptMessage[];
  messages: MessageMetrics;
  user: UserInfo;
  sentiment: "positive" | "neutral" | "negative";
  escalated: boolean;
  forwarded_hr: boolean;
  category: string;
  questions: string[];
  summary: string;
  user_rating?: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ChartData {
  sentiment_labels: string[];
  sentiment_values: number[];
  resolution_labels: string[];
  resolution_values: number[];
  category_labels: string[];
  category_values: number[];
  questions_labels: string[];
  questions_values: number[];
  dates_labels: string[];
  dates_values: number[];
}

export interface Metrics {
  "Total Conversations": number;
  "Unique Users": number;
  "Avg. Conversation Length (min)": number;
  "Avg. Response Time (sec)": number;
  "Resolved Chats (%)": number;
  "Average Daily Cost (€)": number;
  "Peak Usage Time": string;
}
