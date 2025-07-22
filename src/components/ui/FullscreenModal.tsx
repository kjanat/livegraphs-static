/**
 * Notso AI - Fullscreen Modal Component (migrated to shadcn/ui Dialog)
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { XIcon } from "lucide-react";
import { type ReactNode, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void; // Parent components should wrap this with useCallback to prevent unnecessary re-renders
  children: ReactNode;
  title?: string;
  triggerRef?: React.RefObject<HTMLElement>; // Reference to the element that triggered the modal
}

export function FullscreenModal({
  isOpen,
  onClose,
  children,
  title,
  triggerRef
}: FullscreenModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Capture the trigger element reference to avoid stale closure
    const triggerElement = triggerRef?.current;

    // Body scroll lock
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";

      // Restore focus to trigger element when modal closes
      if (triggerElement) {
        triggerElement.focus();
      }
    };
  }, [isOpen, triggerRef]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="fixed inset-4 sm:inset-8 max-w-none w-auto h-auto p-0 border-0 bg-card rounded-xl shadow-2xl overflow-hidden"
        showCloseButton={false}
      >
        <DialogHeader className="flex items-center justify-between p-4 sm:p-6 border-b m-0 space-y-0">
          {title && <DialogTitle className="text-xl sm:text-2xl font-bold">{title}</DialogTitle>}
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto rounded-lg"
              aria-label="Close fullscreen"
            >
              <XIcon className="h-6 w-6" />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div
          className="p-4 sm:p-6 overflow-auto"
          style={{ height: "calc(100% - var(--modal-header-height, 5rem))" }}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
