"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export function DarkModeTest() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [htmlClass, setHtmlClass] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        setHtmlClass(document.documentElement.className);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  // Only render when DEBUG is enabled
  if (!mounted || process.env.DEBUG !== "true") return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 p-4 bg-card border border-border rounded-lg shadow-lg max-w-xs">
      <h3 className="font-bold mb-2 text-foreground">Dark Mode Debug</h3>
      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">
          Theme: <span className="text-foreground font-mono">{theme}</span>
        </p>
        <p className="text-muted-foreground">
          Resolved: <span className="text-foreground font-mono">{resolvedTheme}</span>
        </p>
        <p className="text-muted-foreground">
          HTML class: <span className="text-foreground font-mono">{htmlClass || "none"}</span>
        </p>
        <p className="text-muted-foreground">
          localStorage:{" "}
          <span className="text-foreground font-mono">
            {typeof window !== "undefined" ? localStorage.getItem("theme") || "null" : "N/A"}
          </span>
        </p>
      </div>
      <div className="mt-3 space-x-2">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`px-2 py-1 text-xs rounded ${theme === "light" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          Light
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`px-2 py-1 text-xs rounded ${theme === "dark" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`px-2 py-1 text-xs rounded ${theme === "system" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          System
        </button>
      </div>
      <div className="mt-3 p-2 bg-background border border-border rounded">
        <p className="text-xs text-muted-foreground">Visual test:</p>
        <div className="flex gap-2 mt-1">
          <div className="w-6 h-6 bg-background border border-border" title="background" />
          <div className="w-6 h-6 bg-foreground" title="foreground" />
          <div className="w-6 h-6 bg-primary" title="primary" />
          <div className="w-6 h-6 bg-secondary" title="secondary" />
        </div>
      </div>
      <div className="mt-2">
        <p className="text-xs text-muted-foreground">DEBUG: {process.env.DEBUG}</p>
      </div>
    </div>
  );
}
