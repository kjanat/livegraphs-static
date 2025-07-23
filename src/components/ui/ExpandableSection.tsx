/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics (enhanced with shadcn/ui)
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll to section when expanded
  useEffect(() => {
    if (isExpanded && sectionRef.current && !defaultExpanded) {
      // Small delay to let expansion animation start
      setTimeout(() => {
        const element = sectionRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          const yOffset = -100; // Offset for fixed header

          // Only scroll if section header is above viewport or too far down
          if (rect.top < 0 || rect.top > 200) {
            const y = element.offsetTop + yOffset;

            window.scrollTo({
              top: y,
              behavior: "smooth"
            });
          }
        }
      }, 100);
    }
  }, [isExpanded, defaultExpanded]);

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
          <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
            Essential
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
          >
            Detailed
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Advanced
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card
      ref={sectionRef}
      className={cn("transition-all duration-300 p-0 border", getPriorityStyles(), className)}
      data-expandable-section
    >
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="w-full p-4 sm:p-6 text-left flex items-center justify-between h-auto hover:bg-background/50 focus:bg-background/50 rounded-t-lg min-h-[44px] font-normal"
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
            <ChevronUp size={24} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={24} className="text-muted-foreground" />
          )}
        </div>
      </Button>

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
          className={`pb-4 px-6 transition-all duration-300 ${
            isExpanded ? "animate-in fade-in slide-in-from-top-2" : ""
          }`}
        >
          {children}
        </div>
      </div>
    </Card>
  );
}
