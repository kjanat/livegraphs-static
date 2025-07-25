/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { MobileUploadSection } from "@/components/mobile/MobileUploadSection";
import { UploadSection } from "@/components/sections/UploadSection";
import { useFileUpload } from "@/lib/hooks/useFileUpload";
import { useIsMobile } from "@/lib/hooks/useMediaQuery";
import type { ChatSession } from "@/lib/types/session";

interface FileUploadManagerProps {
  hasData: boolean;
  hasDateRange: boolean;
  isUploading: boolean;
  uploadError: string | null;
  onFileUpload: (jsonData: ChatSession[]) => Promise<number>;
  onClearDatabase: () => void;
  onExportCSV: () => void;
  onUploadSuccess: () => Promise<void>;
}

/**
 * Renders a file upload manager for a chatbot analytics dashboard, handling file uploads, drag-and-drop events, and related actions.
 *
 * Selects a mobile or desktop upload section based on device type, manages upload state and errors, and passes all relevant handlers and flags to the chosen upload section component.
 */
export function FileUploadManager({
  hasData,
  hasDateRange,
  isUploading: externalIsUploading,
  uploadError: externalUploadError,
  onFileUpload,
  onClearDatabase,
  onExportCSV,
  onUploadSuccess
}: FileUploadManagerProps) {
  const isMobile = useIsMobile();

  const {
    isUploading,
    uploadError,
    isDragging,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  } = useFileUpload(onFileUpload, {
    onSuccess: onUploadSuccess
  });

  const Component = isMobile ? MobileUploadSection : UploadSection;

  return (
    <Component
      isUploading={isUploading || externalIsUploading}
      uploadError={uploadError || externalUploadError}
      hasData={hasData}
      hasDateRange={hasDateRange}
      onFileUpload={handleFileUpload}
      onClearDatabase={onClearDatabase}
      onExportCSV={onExportCSV}
      isDragging={isDragging}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    />
  );
}
