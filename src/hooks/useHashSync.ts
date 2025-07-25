/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useEffect, useRef } from "react";

/**
 * Synchronizes a string value with the browser's URL hash, enabling shareable state via the URL.
 *
 * If a `key` is provided, the hash is prefixed with `key-` (e.g., `#tab-overview`). The hook updates the hash without adding a new browser history entry and avoids update loops. It returns a function to retrieve the current hash value, optionally stripping the key prefix.
 *
 * @param value - The string value to synchronize with the URL hash
 * @param key - Optional prefix to namespace the hash value
 * @returns An object with `getHashValue`, a function that retrieves the current hash value or `null` if unavailable or mismatched
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
