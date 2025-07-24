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
