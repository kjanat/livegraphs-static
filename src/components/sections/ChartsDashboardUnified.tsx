/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useMemo, useRef } from "react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ChartData, Metrics } from "@/lib/types/session";
import { CHART_GROUPS, calculateChartVisibility } from "./chartConfig";

interface ChartsDashboardUnifiedProps {
  metrics: Metrics;
  chartData: ChartData;
  viewMode?: "tabs" | "expandable";
}

export function ChartsDashboardUnified({
  metrics,
  chartData,
  viewMode = "tabs"
}: ChartsDashboardUnifiedProps) {
  const totalSessions = metrics["Total Conversations"] || 0;
  const tabsRef = useRef<HTMLDivElement>(null);

  // Calculate visibility flags
  const visibility = useMemo(
    () => calculateChartVisibility(chartData, totalSessions),
    [chartData, totalSessions]
  );

  // Filter visible chart groups
  const visibleGroups = useMemo(
    () => CHART_GROUPS.filter((group) => !group.isVisible || group.isVisible(visibility)),
    [visibility]
  );

  // Handle tab change with smooth scrolling
  const handleTabChange = () => {
    if (viewMode === "tabs" && tabsRef.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const element = tabsRef.current;
          if (element) {
            const yOffset = -100; // Offset for fixed header
            const y = element.offsetTop + yOffset;
            window.scrollTo({
              top: y,
              behavior: "smooth"
            });
          }
        });
      });
    }
  };

  // Props for chart content rendering
  const contentProps = { chartData, metrics, visibility };

  // Render expandable view
  if (viewMode === "expandable") {
    return (
      <div className="space-y-6">
        {visibleGroups.map((group) => {
          const defaultExpanded =
            typeof group.defaultExpanded === "function"
              ? group.defaultExpanded(visibility)
              : (group.defaultExpanded ?? false);

          return (
            <ExpandableSection
              key={group.id}
              title={group.title}
              subtitle={group.subtitle}
              defaultExpanded={defaultExpanded}
              priority={group.priority}
            >
              {group.renderContent(contentProps)}
            </ExpandableSection>
          );
        })}
      </div>
    );
  }

  // Render tabs view
  return (
    <div ref={tabsRef}>
      <Tabs
        defaultValue={visibleGroups[0]?.id || "overview"}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <div className="relative w-full">
          <div className="w-full overflow-x-auto scrollbar-none lg:overflow-visible">
            <TabsList
              className={`inline-flex h-10 min-w-full items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground lg:grid lg:w-full lg:grid-cols-${visibleGroups.length}`}
            >
              {visibleGroups.map((group) => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="min-w-[120px] whitespace-nowrap lg:min-w-0"
                >
                  {group.title.replace(" & ", " ")}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {/* Scroll indicator for mobile/tablet */}
          <div className="absolute right-0 top-0 h-10 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
        </div>

        {visibleGroups.map((group) => (
          <TabsContent key={group.id} value={group.id} className="space-y-6 min-h-[400px]">
            <h3 className="text-xl font-bold mb-4">{group.title}</h3>
            {group.renderContent(contentProps)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
