/**
 * Notso AI - Keyboard Navigation Hook
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Usage example:
 * const uploadRef = useRef<HTMLInputElement>(null);
 * const exportRef = useRef<HTMLButtonElement>(null);
 *
 * useKeyboardNavigation({
 *   uploadRef,
 *   exportRef,
 *   shortcuts: { upload: 'o' }, // Custom shortcut key
 *   onShortcut: (action) => console.log(`Triggered: ${action}`)
 * });
 *
 * Default shortcuts:
 * - Ctrl/Cmd+O: Upload (Open)
 * - Ctrl/Cmd+E: Export
 * - Ctrl/Cmd+/: Search
 */

import { type RefObject, useCallback, useEffect } from "react";

// Throttle utility function for performance optimization
function throttle<Args extends readonly unknown[], Return>(
  func: (...args: Args) => Return,
  limit: number
): (...args: Args) => void {
  let inThrottle: boolean;
  return (...args: Args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Debounce utility function for performance optimization
function debounce<Args extends readonly unknown[], Return>(
  func: (...args: Args) => Return,
  delay: number
): (...args: Args) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export interface KeyboardNavigationOptions {
  // Element refs or selectors for keyboard shortcuts
  uploadRef?: RefObject<HTMLInputElement> | string;
  exportRef?: RefObject<HTMLButtonElement> | string;
  searchRef?: RefObject<HTMLInputElement> | string;
  // Custom shortcut key mappings (defaults to non-conflicting keys)
  shortcuts?: {
    upload?: string; // Default: 'o' (Open)
    export?: string; // Default: 'e' (Export)
    search?: string; // Default: '/' (Search)
  };
  // Callback for when shortcuts are triggered
  onShortcut?: (action: string) => void;
}

export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const { uploadRef, exportRef, searchRef, shortcuts = {}, onShortcut } = options;

  // Default shortcuts that don't conflict with browser defaults
  const keyMap = {
    upload: shortcuts.upload || "o", // 'o' for Open instead of 'u' which conflicts with view-source
    export: shortcuts.export || "e",
    search: shortcuts.search || "/"
  };

  const getElement = useCallback(
    (ref: RefObject<HTMLElement> | string | undefined, fallbackSelector?: string) => {
      if (!ref) {
        return fallbackSelector ? (document.querySelector(fallbackSelector) as HTMLElement) : null;
      }

      if (typeof ref === "string") {
        return document.querySelector(ref) as HTMLElement;
      }

      return ref.current;
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case keyMap.upload: {
            // Upload (Ctrl/Cmd+O for "Open")
            e.preventDefault();
            const uploadInput = getElement(uploadRef, 'input[type="file"]') as HTMLInputElement;
            if (uploadInput) {
              uploadInput.click();
              onShortcut?.("upload");
            } else {
              console.warn("Keyboard navigation: Upload input not found");
            }
            break;
          }
          case keyMap.export: {
            // Export (Ctrl/Cmd+E)
            e.preventDefault();
            const exportButton = getElement(
              exportRef,
              '[aria-label="Export data as CSV file"]'
            ) as HTMLButtonElement;
            if (exportButton) {
              exportButton.click();
              onShortcut?.("export");
            } else {
              console.warn("Keyboard navigation: Export button not found");
            }
            break;
          }
          case keyMap.search: {
            // Focus search (Ctrl/Cmd+/)
            e.preventDefault();
            const searchInput = getElement(searchRef, 'input[type="search"]') as HTMLInputElement;
            if (searchInput) {
              searchInput.focus();
              onShortcut?.("search");
            } else {
              console.warn("Keyboard navigation: Search input not found");
            }
            break;
          }
        }
      }

      // Tab navigation improvements
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation");
    };

    // Apply performance optimizations
    const throttledKeyDown = throttle(handleKeyDown, 100); // Throttle to max 10 calls per second
    const debouncedMouseDown = debounce(handleMouseDown, 50); // Debounce with 50ms delay

    document.addEventListener("keydown", throttledKeyDown);
    document.addEventListener("mousedown", debouncedMouseDown);

    return () => {
      document.removeEventListener("keydown", throttledKeyDown);
      document.removeEventListener("mousedown", debouncedMouseDown);
    };
  }, [
    uploadRef,
    exportRef,
    searchRef,
    keyMap.upload,
    keyMap.export,
    keyMap.search,
    getElement,
    onShortcut
  ]);
}
