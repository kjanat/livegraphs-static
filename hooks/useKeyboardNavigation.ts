/**
 * Notso AI - Keyboard Navigation Hook
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect } from "react";

export function useKeyboardNavigation() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "u": {
            // Upload
            e.preventDefault();
            const uploadInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            uploadInput?.click();
            break;
          }
          case "e": {
            // Export
            e.preventDefault();
            const exportButton = document.querySelector(
              '[aria-label="Export data as CSV file"]'
            ) as HTMLButtonElement;
            exportButton?.click();
            break;
          }
          case "/": {
            // Focus search (if exists)
            e.preventDefault();
            const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
            searchInput?.focus();
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

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);
}

// Add to globals.css:
// .keyboard-navigation *:focus {
//   outline: 2px solid var(--ring);
//   outline-offset: 2px;
// }
