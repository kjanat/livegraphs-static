/**
 * Notso AI - Sample Data Generator
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// Type definitions for generated sample data
interface SampleSession {
  session_id: string;
  start_time: string;
  end_time: string;
  transcript: Array<{
    timestamp: string;
    role: "User" | "Assistant";
    content: string;
  }>;
  messages: {
    response_time: { avg: number };
    amount: { user: number; total: number };
    tokens: number;
    cost: { eur: { cent: number; full: number } };
    source_url: string;
  };
  user: {
    ip: string;
    country: string;
    language: string;
  };
  sentiment: "positive" | "neutral" | "negative";
  escalated: boolean;
  forwarded_hr: boolean;
  category: string;
  questions: string[];
  summary: string;
  user_rating: number;
}

export const SAMPLE_DATA_CONSTANTS = {
  categories: [
    "Technical Support",
    "Billing",
    "Account Management",
    "Product Information",
    "General Inquiry",
    "Feature Request",
    "Bug Report",
    "Onboarding",
    "Unrecognized / Other"
  ],
  sentiments: ["Positive", "Neutral", "Negative"],
  negativeKeywords: [
    "trouble",
    "problem",
    "issue",
    "can't",
    "cannot",
    "broken",
    "error",
    "failed",
    "stuck"
  ],
  questions: [
    "How do I reset my password?",
    "What are your pricing plans?",
    "How can I upgrade my account?",
    "I'm having trouble logging in",
    "Can you explain this feature?",
    "How do I export my data?",
    "Is there a mobile app available?",
    "How secure is my data?",
    "Can I integrate with other tools?",
    "What's included in the free plan?",
    "How do I cancel my subscription?",
    "Can I get a demo?",
    "What payment methods do you accept?",
    "How do I add team members?",
    "Is there an API available?"
  ],
  countries: ["NL", "DE", "FR", "GB", "US", "ES", "IT", "BE", "PL", "SE"],
  languages: ["en", "nl", "de", "fr", "es", "it", "pl", "sv"]
} as const;

// Destructure for internal use
const { categories, sentiments, negativeKeywords, questions, countries, languages } =
  SAMPLE_DATA_CONSTANTS;

function randomElement<T>(array: readonly T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot select random element from empty array");
  }
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSession(index: number, date: Date): SampleSession {
  const startTime = new Date(date);
  startTime.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59));

  const duration = randomInt(2, 20); // minutes
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const messagesCount = randomInt(2, 15);
  const responseTime = randomInt(1, 10);
  const sentimentValue = randomElement(sentiments);
  const selectedQuestion = randomElement(questions);

  // Enhanced escalation logic
  const hasNegativeKeywords = negativeKeywords.some((keyword) =>
    selectedQuestion.toLowerCase().includes(keyword)
  );
  const isSlowResponse = responseTime > 7;
  const baseEscalationChance = sentimentValue === "Negative" ? 0.5 : 0.1;
  const escalationModifier = (hasNegativeKeywords ? 0.3 : 0) + (isSlowResponse ? 0.2 : 0);
  const escalated = Math.random() < baseEscalationChance + escalationModifier;

  // Generate transcript
  const transcript = [];

  transcript.push({
    timestamp: startTime.toISOString(),
    role: "User" as const,
    content: selectedQuestion
  });

  transcript.push({
    timestamp: new Date(startTime.getTime() + responseTime * 1000).toISOString(),
    role: "Assistant" as const,
    content: "Thank you for your question. I'll help you with that..."
  });

  // Add more messages based on messagesCount
  for (let i = 2; i < messagesCount; i++) {
    const isUser = i % 2 === 0;
    const msgTime = new Date(startTime.getTime() + duration * 60000 * (i / messagesCount));
    transcript.push({
      timestamp: msgTime.toISOString(),
      role: (isUser ? "User" : "Assistant") as "User" | "Assistant",
      content: isUser
        ? "I see, can you provide more details?"
        : "Certainly! Here's what you need to know..."
    });
  }

  const tokensUsed = messagesCount * randomInt(50, 200);
  const costInCents = Math.floor(tokensUsed * 0.002);
  const costInEur = costInCents / 100;

  return {
    session_id: `${date.toISOString().split("T")[0]}-${String(index).padStart(4, "0")}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}-${randomInt(100000000000, 999999999999)}`,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    transcript,
    messages: {
      response_time: {
        avg: responseTime
      },
      amount: {
        user: Math.ceil(messagesCount / 2),
        total: messagesCount
      },
      tokens: tokensUsed,
      cost: {
        eur: {
          cent: costInCents,
          full: costInEur
        }
      },
      source_url: "https://example.com/chat"
    },
    user: {
      ip: `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`,
      country: randomElement(countries),
      language: randomElement(languages)
    },
    sentiment: sentimentValue.toLowerCase() as "positive" | "neutral" | "negative",
    escalated,
    forwarded_hr: false,
    // 15% chance to use "Unrecognized / Other" category
    category:
      Math.random() < 0.15
        ? "Unrecognized / Other"
        : randomElement(categories.filter((c) => c !== "Unrecognized / Other")),
    questions: [selectedQuestion],
    summary: `User asked about: ${selectedQuestion}. The conversation was ${sentimentValue.toLowerCase()} and ${escalated ? "was escalated" : "resolved successfully"}.`,
    user_rating:
      sentimentValue === "Positive"
        ? randomInt(4, 5)
        : sentimentValue === "Negative"
          ? randomInt(1, 3)
          : randomInt(3, 4)
  };
}

export function generateSampleData(daysOfHistory = 365): SampleSession[] {
  const sessions: SampleSession[] = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysOfHistory); // Default to 1 year of data

  // Generate variable sessions per day (more realistic pattern)
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    // Vary session count by day of week and month
    const dayOfWeek = currentDate.getDay();
    const month = currentDate.getMonth();

    // Lower activity on weekends
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const weekendFactor = isWeekend ? 0.3 : 1.0;

    // Seasonal variation (lower in summer months)
    const seasonalFactor = month >= 5 && month <= 7 ? 0.7 : 1.0;

    const baseSessionCount = randomInt(15, 40);
    const sessionsPerDay = Math.floor(baseSessionCount * weekendFactor * seasonalFactor);

    for (let i = 0; i < sessionsPerDay; i++) {
      sessions.push(generateSession(i, new Date(currentDate)));
    }
    // Move to next day
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return sessions; // Return array directly to match validation schema
}
