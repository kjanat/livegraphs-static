/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { useEffect, useState } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const hasExplicitDark = htmlElement.classList.contains("dark");
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      setIsDark(hasExplicitDark || (!htmlElement.classList.contains("light") && systemPrefersDark));
    };

    checkTheme();

    // Listen for system color scheme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => checkTheme();
    mediaQuery.addEventListener("change", handleChange);

    // Listen for manual theme changes (class changes on html element)
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, []);

  return { isDark };
}
