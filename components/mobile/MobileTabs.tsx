/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useRef, useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface MobileTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (tabId: string) => void;
  children: (activeTab: string) => React.ReactNode;
}

export function MobileTabs({ tabs, defaultTab, onTabChange, children }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || "");
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);

    // Scroll the selected tab into view
    const tabElement = tabRefs.current[tabId];
    if (tabElement && tabsContainerRef.current) {
      // Calculate scroll position to center the tab if possible
      const containerWidth = tabsContainerRef.current.offsetWidth;
      const tabLeft = tabElement.offsetLeft;
      const tabWidth = tabElement.offsetWidth;
      const scrollLeft = tabLeft - containerWidth / 2 + tabWidth / 2;

      tabsContainerRef.current.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="relative mb-4">
        <div
          ref={tabsContainerRef}
          className="flex overflow-x-auto scrollbar-hide border-b border-border"
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap transition-colors min-w-fit ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Fade indicators for scroll */}
        <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">{children(activeTab)}</div>
    </div>
  );
}
