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

// Alias for common use case
export function useIsDesktop(): boolean {
  return useBreakpoint("md");
}
