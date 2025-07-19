/**
 * Notso AI - Sample Data Generator
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// No type import needed as we'll return the raw data structure

const categories = [
  "Technical Support",
  "Billing",
  "Account Management",
  "Product Information",
  "General Inquiry",
  "Feature Request",
  "Bug Report",
  "Onboarding"
];

const sentiments = ["Positive", "Neutral", "Negative"];

const questions = [
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
];

const countries = ["NL", "DE", "FR", "GB", "US", "ES", "IT", "BE", "PL", "SE"];
const languages = ["en", "nl", "de", "fr", "es", "it", "pl", "sv"];

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface SampleSession {
  session_id: string;
  start_time: string;
  end_time: string;
  questions: string;
  category: string;
  sentiment: string;
  escalated: 0 | 1;
  forwarded_hr: 0 | 1;
  avg_response_time: number;
  tokens_eur: number;
  rating: number;
  ip_address: string;
  country: string;
  language: string;
  conversation_duration: number;
  messages_count: number;
}

function generateSession(index: number, date: Date): SampleSession {
  const startTime = new Date(date);
  startTime.setHours(randomInt(8, 20), randomInt(0, 59), randomInt(0, 59));

  const duration = randomInt(2, 20); // minutes
  const endTime = new Date(startTime.getTime() + duration * 60000);

  const messagesCount = randomInt(2, 15);
  const responseTime = randomInt(1, 10);
  const sentiment = randomElement(sentiments);
  const escalated = sentiment === "Negative" && Math.random() > 0.5;

  return {
    session_id: `session_${date.toISOString().split("T")[0]}_${index}`,
    start_time: startTime.toISOString(),
    end_time: endTime.toISOString(),
    questions: randomElement(questions),
    category: randomElement(categories),
    sentiment,
    escalated: escalated ? 1 : 0,
    forwarded_hr: 0,
    avg_response_time: responseTime,
    tokens_eur: parseFloat((Math.random() * 0.5 + 0.1).toFixed(4)),
    rating:
      sentiment === "Positive"
        ? randomInt(4, 5)
        : sentiment === "Negative"
          ? randomInt(1, 3)
          : randomInt(3, 4),
    ip_address: `${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}.${randomInt(1, 255)}`,
    country: randomElement(countries),
    language: randomElement(languages),
    conversation_duration: duration,
    messages_count: messagesCount
  };
}

export function generateSampleData() {
  const sessions = [];
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // 30 days of data

  // Generate 10-30 sessions per day
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const sessionsPerDay = randomInt(10, 30);
    for (let i = 0; i < sessionsPerDay; i++) {
      sessions.push(generateSession(i, new Date(d)));
    }
  }

  return sessions; // Return array directly to match validation schema
}
