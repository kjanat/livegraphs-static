/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ClearDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

/**
 * Renders a modal dialog prompting the user to confirm clearing all data from the database.
 *
 * Displays a warning that all sessions will be permanently deleted and the action cannot be undone. Provides cancel and confirm actions; confirming triggers the provided callback.
 *
 * @param open - Whether the dialog is visible
 * @param onOpenChange - Callback invoked when the dialog's open state changes
 * @param onConfirm - Callback invoked when the user confirms the clear action
 */
export function ClearDatabaseDialog({ open, onOpenChange, onConfirm }: ClearDatabaseDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all sessions from the database. This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Clear Database
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
