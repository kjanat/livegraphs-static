import { endOfDay, startOfDay } from "date-fns";
import { describe, expect, it } from "vitest";
import {
  applyTimeToRange,
  createDisabledDayMatcher,
  formatDateRange,
  normalizeRange,
  validateDuration
} from "./utils";

describe("DateRangePicker Utils", () => {
  describe("validateDuration", () => {
    it("returns error when range is undefined", () => {
      const result = validateDuration(undefined);
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please select both start and end dates");
    });

    it("returns error when only start date is selected", () => {
      const result = validateDuration({ from: new Date(), to: undefined });
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please select both start and end dates");
    });

    it("returns error when only end date is selected", () => {
      const result = validateDuration({ from: undefined, to: new Date() });
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please select both start and end dates");
    });

    it("validates minimum duration correctly", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 3); // 3 days

      // Should pass with 3 day minimum
      expect(validateDuration({ from, to }, 3)).toEqual({ valid: true });

      // Should fail with 5 day minimum
      const result = validateDuration({ from, to }, 5);
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please select at least 5 days");
    });

    it("validates maximum duration correctly", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 10); // 10 days

      // Should pass with 10 day maximum
      expect(validateDuration({ from, to }, undefined, 10)).toEqual({ valid: true });

      // Should fail with 5 day maximum
      const result = validateDuration({ from, to }, undefined, 5);
      expect(result.valid).toBe(false);
      expect(result.message).toBe("Please select no more than 5 days");
    });

    it("validates both min and max duration together", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 7); // 7 days

      // Should pass when within range
      expect(validateDuration({ from, to }, 5, 10)).toEqual({ valid: true });

      // Should fail when below minimum
      expect(validateDuration({ from, to }, 10, 20).valid).toBe(false);

      // Should fail when above maximum
      expect(validateDuration({ from, to }, 1, 5).valid).toBe(false);
    });

    it("calculates duration correctly across month boundaries", () => {
      const from = new Date(2024, 0, 30); // Jan 30
      const to = new Date(2024, 1, 2); // Feb 2

      // Should be 4 days (Jan 30, 31, Feb 1, 2)
      const result = validateDuration({ from, to }, 4, 4);
      expect(result.valid).toBe(true);
    });
  });

  describe("formatDateRange", () => {
    it("returns placeholder when no range selected", () => {
      expect(formatDateRange(undefined)).toBe("Select date range");
    });

    it("formats single date when only from is selected", () => {
      const date = new Date(2024, 0, 15);
      expect(formatDateRange({ from: date })).toBe("Jan 15, 2024");
    });

    it("formats date range when both dates selected", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 7);
      expect(formatDateRange({ from, to })).toBe("Jan 1, 2024 - Jan 7, 2024");
    });

    it("uses custom date format", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 7);
      expect(formatDateRange({ from, to }, "dd/MM/yyyy")).toBe("01/01/2024 - 07/01/2024");
    });
  });

  describe("normalizeRange", () => {
    it("returns undefined when range is undefined", () => {
      expect(normalizeRange(undefined)).toBeUndefined();
    });

    it("returns range unchanged when dates are missing", () => {
      const from = new Date();
      expect(normalizeRange({ from })).toEqual({ from });

      const to = new Date();
      expect(normalizeRange({ from: undefined, to })).toEqual({ from: undefined, to });
    });

    it("swaps dates when from is after to", () => {
      const earlier = new Date(2024, 0, 1);
      const later = new Date(2024, 0, 7);

      const result = normalizeRange({ from: later, to: earlier });
      expect(result?.from).toEqual(earlier);
      expect(result?.to).toEqual(later);
    });

    it("returns range unchanged when dates are in correct order", () => {
      const from = new Date(2024, 0, 1);
      const to = new Date(2024, 0, 7);

      const result = normalizeRange({ from, to });
      expect(result).toEqual({ from, to });
    });
  });

  describe("applyTimeToRange", () => {
    it("returns undefined when range is undefined", () => {
      expect(applyTimeToRange(undefined)).toBeUndefined();
    });

    it("returns range unchanged when dates are missing", () => {
      const from = new Date(2024, 0, 1, 12, 30);
      expect(applyTimeToRange({ from })).toEqual({ from });
    });

    it("sets start of day for from and end of day for to", () => {
      const from = new Date(2024, 0, 1, 12, 30);
      const to = new Date(2024, 0, 7, 15, 45);

      const result = applyTimeToRange({ from, to });

      expect(result?.from).toEqual(startOfDay(from));
      expect(result?.to).toEqual(endOfDay(to));

      // Verify exact times
      expect(result?.from?.getHours()).toBe(0);
      expect(result?.from?.getMinutes()).toBe(0);
      expect(result?.to?.getHours()).toBe(23);
      expect(result?.to?.getMinutes()).toBe(59);
    });
  });

  describe("createDisabledDayMatcher", () => {
    it("returns undefined when availableDates is undefined", () => {
      expect(createDisabledDayMatcher(undefined)).toBeUndefined();
    });

    it("returns undefined when availableDates is empty", () => {
      expect(createDisabledDayMatcher(new Set())).toBeUndefined();
    });

    it("creates function that disables dates not in available set", () => {
      const availableDates = new Set(["2024-01-01", "2024-01-03", "2024-01-05"]);

      const matcher = createDisabledDayMatcher(availableDates);

      // Available dates should not be disabled
      expect(matcher?.(new Date(2024, 0, 1))).toBe(false);
      expect(matcher?.(new Date(2024, 0, 3))).toBe(false);
      expect(matcher?.(new Date(2024, 0, 5))).toBe(false);

      // Unavailable dates should be disabled
      expect(matcher?.(new Date(2024, 0, 2))).toBe(true);
      expect(matcher?.(new Date(2024, 0, 4))).toBe(true);
      expect(matcher?.(new Date(2024, 0, 6))).toBe(true);
    });

    it("handles dates across different months correctly", () => {
      const availableDates = new Set(["2024-01-31", "2024-02-01"]);

      const matcher = createDisabledDayMatcher(availableDates);

      expect(matcher?.(new Date(2024, 0, 31))).toBe(false); // Jan 31
      expect(matcher?.(new Date(2024, 1, 1))).toBe(false); // Feb 1
      expect(matcher?.(new Date(2024, 0, 30))).toBe(true); // Jan 30
    });
  });
});
