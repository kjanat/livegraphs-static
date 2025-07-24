/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef } from "react";

/**
 * Hook to sync a value with URL hash for shareable state
 * @param value - The value to sync with the hash
 * @param key - Optional prefix for the hash (e.g., "tab" → "#tab-overview")
 */
export function useHashSync(value: string | undefined, key = "") {
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!value || typeof window === "undefined") return;

    // Skip if this is an internal update (to avoid loops)
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }

    // Update hash
    const hashValue = key ? `${key}-${value}` : value;
    const newHash = `#${hashValue}`;

    if (window.location.hash !== newHash) {
      // Use replaceState to avoid polluting history
      window.history.replaceState(null, "", newHash);
    }
  }, [value, key]);

  // Return a function to read hash value
  const getHashValue = (): string | null => {
    if (typeof window === "undefined") return null;

    const hash = window.location.hash.slice(1); // Remove #
    if (!hash) return null;

    if (key) {
      const prefix = `${key}-`;
      return hash.startsWith(prefix) ? hash.slice(prefix.length) : null;
    }

    return hash;
  };

  return { getHashValue };
}
