/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { toast } from "sonner";

interface ConfirmClearDatabaseToastProps {
  onConfirm: () => void;
  toastId: string | number;
}

export function ConfirmClearDatabaseToast({ onConfirm, toastId }: ConfirmClearDatabaseToastProps) {
  return (
    <div className="bg-card rounded-lg p-4 shadow-lg border border-border max-w-md">
      <h3 className="font-semibold text-base mb-2">Clear All Data?</h3>
      <p className="text-sm text-muted-foreground mb-4">
        This will permanently delete all sessions from the database. This action cannot be undone.
      </p>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => toast.dismiss(toastId)}
          className="px-3 py-1.5 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            toast.dismiss(toastId);
            toast.success("Database cleared successfully");
          }}
          className="px-3 py-1.5 text-sm font-medium bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md transition-colors"
        >
          Clear Database
        </button>
      </div>
    </div>
  );
}

export function showConfirmClearDatabaseToast(onConfirm: () => void) {
  toast.custom((t) => <ConfirmClearDatabaseToast onConfirm={onConfirm} toastId={t} />, {
    duration: 60000, // 1 minute timeout
    position: "top-center"
  });
}
