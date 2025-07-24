/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";
"use memo"; // React Compiler directive for automatic optimization

import { memo, startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExpandableSection } from "@/components/ui/ExpandableSection";
import { LazyChart } from "@/components/ui/LazyChart";
import { TabsScrollIndicators } from "@/components/ui/TabsScrollIndicators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHashSync } from "@/hooks/useHashSync";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";
import { getGridColsClass, TAB_STORAGE_KEY } from "@/lib/constants/tabs";
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

  // State for controlled tabs with localStorage persistence
  const [selectedTab, setSelectedTab] = useState<string | undefined>();

  // Sync selected tab with URL hash
  const { getHashValue } = useHashSync(selectedTab, "tab");

  // Calculate visibility flags
  const visibility = useMemo(
    () => calculateChartVisibility(chartData, totalSessions),
    [chartData, totalSessions]
  );

  // Filter visible chart groups using helper function
  const visibleGroups = useMemo(() => getVisibleGroups(visibility), [visibility]);

  // Initialize selected tab from URL hash, localStorage, or default
  useEffect(() => {
    if (viewMode === "tabs" && visibleGroups.length > 0) {
      const hashTab = getHashValue();
      const storedTab = localStorage.getItem(TAB_STORAGE_KEY);
      const defaultTab = visibleGroups[0].id;

      // Priority: URL hash > localStorage > default
      let initialTab = defaultTab;

      if (hashTab && visibleGroups.some((g) => g.id === hashTab)) {
        initialTab = hashTab;
      } else if (storedTab && visibleGroups.some((g) => g.id === storedTab)) {
        initialTab = storedTab;
      }

      setSelectedTab(initialTab);
    }
  }, [viewMode, visibleGroups, getHashValue]);

  // Handle tab change with smooth scrolling and persistence
  const handleTabChange = useCallback(
    (value: string) => {
      setSelectedTab(value);

      // Persist to localStorage
      localStorage.setItem(TAB_STORAGE_KEY, value);

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
  const gridColsClass = getGridColsClass(visibleGroups.length);

  return (
    <div ref={tabsRef}>
      <Tabs value={selectedTab} className="w-full" onValueChange={handleTabChange}>
        <TabsScrollIndicators className="w-full">
          <TabsList
            className={`inline-flex h-10 min-w-full items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground lg:grid lg:w-full ${gridColsClass}`}
            aria-label="Chart sections"
          >
            {visibleGroups.map((group) => (
              <TabsTrigger
                key={group.id}
                value={group.id}
                className="min-w-[120px] whitespace-nowrap lg:min-w-0"
                aria-label={`View ${group.title} charts`}
                aria-controls={`tabpanel-${group.id}`}
                title={group.subtitle}
              >
                <span className="truncate">{group.title.replace(" & ", " ")}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </TabsScrollIndicators>

        {selectedTab &&
          visibleGroups.map((group) => {
            const Component = group.Component;
            const isActive = selectedTab === group.id;

            // Only render the active tab panel for better performance
            if (!isActive) {
              return (
                <TabsContent
                  key={group.id}
                  value={group.id}
                  className="hidden"
                  id={`tabpanel-${group.id}`}
                  role="tabpanel"
                  aria-labelledby={`tab-${group.id}`}
                  aria-hidden="true"
                />
              );
            }

            return (
              <TabsContent
                key={group.id}
                value={group.id}
                className="space-y-6 animate-in fade-in-0 duration-200"
                id={`tabpanel-${group.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${group.id}`}
                tabIndex={0}
              >
                <div className="sr-only" aria-live="polite" aria-atomic="true">
                  Now showing {group.title} charts
                </div>
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
