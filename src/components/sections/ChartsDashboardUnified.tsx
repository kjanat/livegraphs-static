/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";
"use memo"; // React Compiler directive for automatic optimization

import { memo, startTransition, useCallback, useMemo, useRef } from "react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { LazyChart } from "@/components/ui/LazyChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import type { ChartData, Metrics } from "@/lib/types/session";
import { calculateChartVisibility, getVisibleGroups, isGroupExpanded } from "./chartConfig";

interface ChartsDashboardUnifiedProps {
  metrics: Metrics;
  chartData: ChartData;
  viewMode?: "tabs" | "expandable";
}

function ChartsDashboardUnifiedBase({
  metrics,
  chartData,
  viewMode = "tabs"
}: ChartsDashboardUnifiedProps) {
  // Performance monitoring in development
  usePerformanceMonitor("ChartsDashboardUnified");

  const totalSessions = metrics["Total Conversations"] || 0;
  const tabsRef = useRef<HTMLDivElement>(null);

  // Calculate visibility flags
  const visibility = useMemo(
    () => calculateChartVisibility(chartData, totalSessions),
    [chartData, totalSessions]
  );

  // Filter visible chart groups using helper function
  const visibleGroups = useMemo(() => getVisibleGroups(visibility), [visibility]);

  // Handle tab change with smooth scrolling - memoized to prevent recreation
  const handleTabChange = useCallback(
    (_value: string) => {
      // Use startTransition for non-urgent UI updates
      startTransition(() => {
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
      });
    },
    [viewMode]
  );

  // Memoize content props to prevent unnecessary re-renders
  const contentProps = useMemo(
    () => ({ chartData, metrics, visibility }),
    [chartData, metrics, visibility]
  );

  // Render expandable view
  if (viewMode === "expandable") {
    return (
      <div className="space-y-6">
        {visibleGroups.map((group) => {
          const defaultExpanded = isGroupExpanded(group, visibility);
          const Component = group.Component;

          return (
            <ExpandableSection
              key={group.id}
              title={group.title}
              subtitle={group.subtitle}
              defaultExpanded={defaultExpanded}
              priority={group.priority}
            >
              <LazyChart chartName={group.title} minHeight={400}>
                <Component {...contentProps} />
              </LazyChart>
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

        {visibleGroups.map((group) => {
          const Component = group.Component;

          return (
            <TabsContent key={group.id} value={group.id} className="space-y-6 min-h-[400px]">
              <h3 className="text-xl font-bold mb-4">{group.title}</h3>
              <LazyChart chartName={group.title} minHeight={400}>
                <Component {...contentProps} />
              </LazyChart>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const ChartsDashboardUnified = memo(ChartsDashboardUnifiedBase);
