/**
 * Core types for the Notso AI application
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
  // Existing charts
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

  // Enhanced time series
  response_time_dates: string[];
  response_time_values: number[];
  cost_dates: string[];
  cost_values: number[];
  daily_message_counts: number[];

  // Geographic distribution
  country_labels: string[];
  country_values: number[];

  // Language distribution
  language_labels: string[];
  language_values: number[];

  // Hourly heatmap data
  hourly_data: {
    hour: number;
    day: string;
    count: number;
  }[];

  // Performance metrics
  conversation_durations: number[];
  messages_per_conversation: number[];

  // Ratings data
  rating_distribution: {
    rating: number;
    count: number;
  }[];
  avg_rating: number | null;

  // Cost analysis
  category_costs: {
    category: string;
    total_cost: number;
    avg_cost: number;
    count: number;
  }[];

  // Sentiment time series
  sentiment_time_series: {
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }[];
}

export interface Metrics {
  "Total Conversations": number;
  "Unique Users": number;
  "Avg. Conversation Length (min)": number;
  "Avg. Response Time (sec)": number;
  "Resolved Chats (%)": number;
  "Average Daily Cost (€)": number;
  "Peak Usage Time": string;
  "Avg. User Rating": number | string;
}
