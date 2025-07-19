/**
 * Notso AI - Fullscreen Modal Component
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void; // Parent components should wrap this with useCallback to prevent unnecessary re-renders
  children: ReactNode;
  title?: string;
}

export function FullscreenModal({ isOpen, onClose, children, title }: FullscreenModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modal = (
    <button
      type="button"
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
      onClick={onClose}
      aria-label="Close modal backdrop"
    >
      <div
        className="fixed inset-4 sm:inset-8 bg-card rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          {title && (
            <h2 id="modal-title" className="text-xl sm:text-2xl font-bold">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors ml-auto"
            aria-label="Close fullscreen"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Close</title>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div
          className="p-4 sm:p-6 overflow-auto"
          style={{ height: "calc(100% - var(--modal-header-height, 5rem))" }}
        >
          {children}
        </div>
      </div>
    </button>
  );

  if (typeof document !== "undefined") {
    return createPortal(modal, document.body);
  }

  return null;
}
