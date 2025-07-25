/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@/components/icons";

interface ExpandableSectionProps {
  title: string;
  subtitle?: string;
  defaultExpanded?: boolean;
  priority: "high" | "medium" | "low";
  children: React.ReactNode;
  className?: string;
}

export function ExpandableSection({
  title,
  subtitle,
  defaultExpanded = false,
  priority,
  children,
  className = ""
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getPriorityStyles = () => {
    switch (priority) {
      case "high":
        return "border-primary/20 bg-primary/5";
      case "medium":
        return "border-border bg-card";
      case "low":
        return "border-muted bg-muted/50";
      default:
        return "border-border bg-card";
    }
  };

  const getPriorityBadge = () => {
    switch (priority) {
      case "high":
        return (
          <span className="text-xs sm:text-sm px-3 py-1.5 bg-primary/10 text-primary rounded-full">
            Essential
          </span>
        );
      case "medium":
        return (
          <span className="text-xs sm:text-sm px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
            Detailed
          </span>
        );
      case "low":
        return (
          <span className="text-xs sm:text-sm px-3 py-1.5 bg-muted text-muted-foreground rounded-full">
            Advanced
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section
      className={`border rounded-lg transition-all duration-300 ${getPriorityStyles()} ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-background/50 focus:bg-background/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 rounded-t-lg min-h-[44px]"
        aria-expanded={isExpanded}
        aria-controls={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title} section`}
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-[1.125rem] sm:text-xl font-bold">{title}</h2>
            {getPriorityBadge()}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="ml-4 flex-shrink-0 p-2 sm:p-2">
          {isExpanded ? (
            <ChevronUpIcon size={24} className="text-muted-foreground" />
          ) : (
            <ChevronDownIcon size={24} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <div
        id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          transform: isExpanded ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div
          className={`pb-6 px-6 transition-all duration-300 ${
            isExpanded ? "animate-in fade-in slide-in-from-top-2" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
