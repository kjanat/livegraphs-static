import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBreakpoint, useIsDesktop } from "./useBreakpoint";

describe("useBreakpoint", () => {
  const originalWindow = global.window;
  const originalInnerWidth = global.innerWidth;

  beforeEach(() => {
    // Reset window mock before each test
    global.innerWidth = 1024;
  });

  afterEach(() => {
    // Restore original window
    global.window = originalWindow;
    global.innerWidth = originalInnerWidth;
  });

  describe("useBreakpoint hook", () => {
    it("returns true when window width is above breakpoint", () => {
      global.innerWidth = 1024;

      const { result } = renderHook(() => useBreakpoint("md"));
      expect(result.current).toBe(true);
    });

    it("returns false when window width is below breakpoint", () => {
      global.innerWidth = 500;

      const { result } = renderHook(() => useBreakpoint("md"));
      expect(result.current).toBe(false);
    });

    it("uses correct breakpoint values", () => {
      // Test sm breakpoint (640px)
      global.innerWidth = 639;
      let { result } = renderHook(() => useBreakpoint("sm"));
      expect(result.current).toBe(false);

      global.innerWidth = 640;
      result = renderHook(() => useBreakpoint("sm")).result;
      expect(result.current).toBe(true);

      // Test lg breakpoint (1024px)
      global.innerWidth = 1023;
      result = renderHook(() => useBreakpoint("lg")).result;
      expect(result.current).toBe(false);

      global.innerWidth = 1024;
      result = renderHook(() => useBreakpoint("lg")).result;
      expect(result.current).toBe(true);
    });

    it("defaults to md breakpoint when not specified", () => {
      global.innerWidth = 768;

      const { result } = renderHook(() => useBreakpoint());
      expect(result.current).toBe(true);
    });

    it("initializes with current window width", () => {
      // Test that the hook initializes correctly based on window width
      global.innerWidth = 1200;

      const { result } = renderHook(() => useBreakpoint("lg"));

      // Should be true since 1200 > 1024 (lg breakpoint)
      expect(result.current).toBe(true);
    });

    it("updates when window is resized", async () => {
      global.innerWidth = 1024;

      const { result, rerender } = renderHook(() => useBreakpoint("md"));
      expect(result.current).toBe(true);

      // Simulate window resize
      global.innerWidth = 500;
      global.dispatchEvent(new Event("resize"));

      // Force re-render to trigger effect
      rerender();

      // Wait for state update
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result.current).toBe(false);
    });

    it("removes event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useBreakpoint("md"));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  describe("useIsDesktop hook", () => {
    it("returns true for desktop widths (>= 768px)", () => {
      global.innerWidth = 768;

      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(true);
    });

    it("returns false for mobile widths (< 768px)", () => {
      global.innerWidth = 767;

      const { result } = renderHook(() => useIsDesktop());
      expect(result.current).toBe(false);
    });

    it("is an alias for useBreakpoint('md')", () => {
      global.innerWidth = 800;

      const { result: desktopResult } = renderHook(() => useIsDesktop());
      const { result: breakpointResult } = renderHook(() => useBreakpoint("md"));

      expect(desktopResult.current).toBe(breakpointResult.current);
    });
  });
});
