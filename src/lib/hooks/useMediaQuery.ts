/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useState } from "react";

/**
 * Custom hook for responsive design with media queries
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define listener
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add listener
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Convenience hook for mobile detection
 * @param breakpoint - Pixel breakpoint for mobile (default: 768)
 * @returns boolean indicating if viewport is mobile size
 */
export function useIsMobile(breakpoint = 768): boolean {
  return !useMediaQuery(`(min-width: ${breakpoint}px)`);
}
