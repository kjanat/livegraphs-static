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

/**
 * Renders a section displaying the top questions and their corresponding counts.
 *
 * If the provided data is missing, empty, or has mismatched array lengths, the component either renders nothing or displays an error message.
 *
 * @param data - Contains `labels` (question texts) and `values` (counts) arrays to display.
 * @returns A styled section with a list of questions and counts, or `null`/an error message if data is invalid.
 */
export function TopQuestionsSection({ data }: TopQuestionsSectionProps) {
  // Validate that both arrays exist and have data
  if (!data.labels || !data.values || data.labels.length === 0) {
    return null;
  }

  // Validate that labels and values arrays have equal length
  if (data.labels.length !== data.values.length) {
    console.error("TopQuestionsSection: labels and values arrays must have equal length");
    return (
      <div className="bg-card rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Top Questions</h3>
        <p className="text-muted-foreground">Unable to display questions: Invalid data format</p>
      </div>
    );
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
            <span className="flex-1 mr-4 truncate">{question}</span>
            <span className="text-muted-foreground font-semibold whitespace-nowrap">
              {data.values[index] ?? 0} times
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
