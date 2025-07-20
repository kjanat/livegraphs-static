/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

interface TopQuestionsSectionProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export function TopQuestionsSection({ data }: TopQuestionsSectionProps) {
  if (data.labels.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg shadow-md p-6 mb-8 transition-all duration-200 hover:shadow-lg">
      <h3 className="text-xl font-bold mb-4">Top Questions</h3>
      <div className="space-y-3">
        {data.labels.map((question, index) => (
          <div
            key={`question-${index}-${question.slice(0, 20)}`}
            className="flex justify-between items-center p-3 bg-secondary rounded transition-colors hover:bg-secondary/80"
          >
            <span className="flex-1 mr-4">{question}</span>
            <span className="text-muted-foreground font-semibold whitespace-nowrap">
              {data.values[index]} times
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
