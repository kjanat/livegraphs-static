/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { ClearDatabaseDialog } from "@/components/dialogs/ClearDatabaseDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface AlertManagerProps {
  showClearDialog: boolean;
  setShowClearDialog: (show: boolean) => void;
  showNoDataAlert: boolean;
  setShowNoDataAlert: (show: boolean) => void;
  onClearConfirm: () => void;
}

/**
 * Renders dialogs for clearing the database and notifying the user when no data is available for the current week.
 *
 * Displays a confirmation dialog for clearing the database and an alert dialog when there is no data for the current week, allowing users to acknowledge the alert or confirm the clear action.
 *
 * @param showClearDialog - Whether the clear database confirmation dialog is visible
 * @param setShowClearDialog - Setter to control the visibility of the clear database dialog
 * @param showNoDataAlert - Whether the no data alert dialog is visible
 * @param setShowNoDataAlert - Setter to control the visibility of the no data alert dialog
 * @param onClearConfirm - Callback invoked when the user confirms clearing the database
 */
export function AlertManager({
  showClearDialog,
  setShowClearDialog,
  showNoDataAlert,
  setShowNoDataAlert,
  onClearConfirm
}: AlertManagerProps) {
  return (
    <>
      {/* Clear Database Dialog */}
      <ClearDatabaseDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={onClearConfirm}
      />

      {/* No Data Alert Dialog */}
      <AlertDialog open={showNoDataAlert} onOpenChange={setShowNoDataAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No data for current week</AlertDialogTitle>
            <AlertDialogDescription>
              The current working week (Monday to today) has no data. We&apos;ve loaded the most
              recent week with available data instead. You can use the date picker to select any
              date range you&apos;d like to analyze.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowNoDataAlert(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
