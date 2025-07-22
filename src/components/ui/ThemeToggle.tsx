/**
 * Notso AI - Theme toggle component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useTheme } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    const themeOrder = ["light", "dark", "system"] as const;
    const currentIndex = themeOrder.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeOrder.length;
    setTheme(themeOrder[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
      aria-label={`Current theme: ${theme}. Click to change theme`}
    >
      {/* Sun icon */}
      <svg
        className={`absolute h-5 w-5 transition-all ${
          resolvedTheme === "light" ? "rotate-0 scale-100" : "rotate-90 scale-0"
        }`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <title>Light mode</title>
        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>

      {/* Moon icon */}
      <svg
        className={`absolute h-5 w-5 transition-all ${
          resolvedTheme === "dark" ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <title>Dark mode</title>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </svg>

      {/* System indicator */}
      {theme === "system" && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-blue-500" />
      )}
    </button>
  );
}
