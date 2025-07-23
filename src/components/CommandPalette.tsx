/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import {
  BarChart3,
  Calendar,
  Database,
  FileJson,
  Globe,
  Hash,
  Languages,
  MessageSquare,
  PieChart,
  TrendingUp
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from "@/components/ui/command";

interface CommandPaletteProps {
  onClearDatabase?: () => void;
  onExportCSV?: () => void;
  onLoadSampleData?: () => void;
  hasData?: boolean;
}

export function CommandPalette({
  onClearDatabase,
  onExportCSV,
  onLoadSampleData,
  hasData = false
}: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAction = (action: () => void | Promise<void>, successMessage?: string) => {
    setOpen(false);
    const result = action();
    if (result instanceof Promise) {
      result.then(() => {
        if (successMessage) toast.success(successMessage);
      });
    } else if (successMessage) {
      toast.success(successMessage);
    }
  };

  const scrollToSection = (sectionTitle: string) => {
    const sections = document.querySelectorAll("[data-expandable-section]");
    for (const section of sections) {
      const titleElement = section.querySelector("h2, h3");
      if (titleElement?.textContent?.toLowerCase().includes(sectionTitle.toLowerCase())) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        // Expand the section if it's collapsed
        const button = section.querySelector("button[aria-expanded]");
        if (button?.getAttribute("aria-expanded") === "false") {
          (button as HTMLButtonElement).click();
        }
        break;
      }
    }
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Command Palette"
      description="Search for charts, filters, or actions"
    >
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation Group */}
        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              scrollToSection("Essential Overview");
            }}
          >
            <PieChart className="mr-2 h-4 w-4" />
            <span>Essential Overview</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              scrollToSection("Performance Trends");
            }}
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            <span>Performance Trends</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              scrollToSection("Geographic & Language");
            }}
          >
            <Globe className="mr-2 h-4 w-4" />
            <span>Geographic Analysis</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              scrollToSection("Category & Cost");
            }}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Category & Cost Analysis</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              scrollToSection("Detailed Statistics");
            }}
          >
            <Hash className="mr-2 h-4 w-4" />
            <span>Detailed Statistics</span>
            <CommandShortcut>Charts</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Actions Group */}
        <CommandGroup heading="Actions">
          <CommandItem
            onSelect={() => {
              handleAction(() => {
                document.getElementById("file-upload-input")?.click();
              });
            }}
          >
            <FileJson className="mr-2 h-4 w-4" />
            <span>Upload JSON File</span>
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>
          {hasData && onExportCSV && (
            <CommandItem onSelect={() => handleAction(onExportCSV, "Data exported successfully")}>
              <Database className="mr-2 h-4 w-4" />
              <span>Export to CSV</span>
              <CommandShortcut>⌘E</CommandShortcut>
            </CommandItem>
          )}
          {hasData && onClearDatabase && (
            <CommandItem
              onSelect={() => handleAction(onClearDatabase, "Database cleared successfully")}
              className="text-destructive"
            >
              <Database className="mr-2 h-4 w-4" />
              <span>Clear Database</span>
            </CommandItem>
          )}
          {!hasData && onLoadSampleData && (
            <CommandItem
              onSelect={() => handleAction(onLoadSampleData, "Sample data loaded successfully")}
            >
              <Database className="mr-2 h-4 w-4" />
              <span>Load Sample Data</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Filters Group */}
        <CommandGroup heading="Filters">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              const dateRangePicker = document.querySelector("[data-date-range-picker]");
              dateRangePicker?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            <span>Date Range Filter</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              // Focus on the first interactive chart
              const firstChart = document.querySelector("[data-chart]");
              if (firstChart instanceof HTMLElement) {
                firstChart.focus();
              }
            }}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Focus First Chart</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              // Toggle theme
              const themeToggle = document.querySelector("[data-theme-toggle]");
              if (themeToggle instanceof HTMLButtonElement) {
                themeToggle.click();
              }
            }}
          >
            <Languages className="mr-2 h-4 w-4" />
            <span>Toggle Theme</span>
            <CommandShortcut>⌘T</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
