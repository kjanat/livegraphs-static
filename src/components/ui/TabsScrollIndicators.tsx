/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface TabsScrollIndicatorsProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component that adds scroll indicators to horizontally scrollable tabs
 * Shows left/right arrows when content overflows
 */
export function TabsScrollIndicators({ children, className }: TabsScrollIndicatorsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, scrollWidth, clientWidth } = element;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1); // -1 for rounding
  }, []);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // Check initial state
    checkScroll();

    // Add resize observer
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(element);

    // Add scroll listener
    element.addEventListener("scroll", checkScroll);

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener("scroll", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollAmount = element.clientWidth * 0.8; // Scroll 80% of visible width
    element.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={scrollRef} className="w-full overflow-x-auto scrollbar-none lg:overflow-visible">
        {children}
      </div>

      {/* Left scroll indicator */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 z-10",
          "bg-background/90 backdrop-blur-sm rounded-full p-1.5",
          "shadow-md border border-border",
          "transition-opacity duration-200",
          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "lg:hidden", // Hide on desktop
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll tabs left"
        tabIndex={canScrollLeft ? 0 : -1}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Right scroll indicator */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 z-10",
          "bg-background/90 backdrop-blur-sm rounded-full p-1.5",
          "shadow-md border border-border",
          "transition-opacity duration-200",
          "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "lg:hidden", // Hide on desktop
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        aria-label="Scroll tabs right"
        tabIndex={canScrollRight ? 0 : -1}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
