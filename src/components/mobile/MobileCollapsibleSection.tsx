/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface MobileCollapsibleSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  badge?: string | number;
}

export function MobileCollapsibleSection({
  title,
  defaultExpanded = false,
  children,
  badge
}: MobileCollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-card rounded-lg shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-muted rounded-full">{badge}</span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="p-3 pt-2 border-t border-border/50">{children}</div>
      </div>
    </div>
  );
}
