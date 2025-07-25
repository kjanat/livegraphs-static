import { useEffect, useState } from "react";

// Tailwind breakpoints
const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

/**
 * Determines if the current window width is at or above a specified Tailwind CSS breakpoint.
 *
 * Returns `true` if the window width is greater than or equal to the given breakpoint, or `false` otherwise. Defaults to the "md" breakpoint if none is specified. Returns `false` during server-side rendering or in non-browser environments.
 *
 * @param breakpoint - The Tailwind CSS breakpoint to compare against (e.g., "sm", "md", "lg", "xl", "2xl")
 * @returns Whether the window width is at or above the specified breakpoint
 */
export function useBreakpoint(breakpoint: BreakpointKey = "md"): boolean {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(() => {
    // Initialize with current window width in browser, default to false in SSR/tests
    if (typeof window !== "undefined") {
      return window.innerWidth >= BREAKPOINTS[breakpoint];
    }
    return false;
  });

  useEffect(() => {
    const checkBreakpoint = () => {
      setIsAboveBreakpoint(window.innerWidth >= BREAKPOINTS[breakpoint]);
    };

    // Check on mount
    checkBreakpoint();

    // Add resize listener
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, [breakpoint]);

  return isAboveBreakpoint;
}

/**
 * Determines if the current window width is at or above the "md" (desktop) breakpoint.
 *
 * @returns `true` if the window width is at least the "md" breakpoint, otherwise `false`
 */
export function useIsDesktop(): boolean {
  return useBreakpoint("md");
}
