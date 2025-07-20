/**
 * Notso AI - Focus Trap Hook
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef } from "react";

export function useFocusTrap(containerRef: React.RefObject<HTMLElement | null>, isActive: boolean) {
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Store the previously focused element
    previouslyFocusedElementRef.current = document.activeElement as HTMLElement;

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => {
        const el = element as HTMLElement;
        // Check if element is disabled (for form elements that support disabled)
        const isFormElement =
          el instanceof HTMLInputElement ||
          el instanceof HTMLButtonElement ||
          el instanceof HTMLSelectElement ||
          el instanceof HTMLTextAreaElement;
        const isDisabled = isFormElement && el.disabled;
        return !isDisabled && el.offsetParent !== null;
      }) as HTMLElement[];
    };

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: if focused on first element, focus last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: if focused on last element, focus first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      // If focus moves outside the container, bring it back
      if (!container.contains(e.relatedTarget as Node)) {
        const focusableElements = getFocusableElements();
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleTabKey);
    container.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      container.removeEventListener("focusout", handleFocusOut);
    };
  }, [containerRef, isActive]);
}
