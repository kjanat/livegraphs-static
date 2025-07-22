/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Download, Loader2, Trash2, Upload } from "lucide-react";
import { UI_DIMENSIONS } from "@/lib/constants/ui";

interface UploadSectionProps {
  // State
  isUploading: boolean;
  uploadError: string | null;
  isDragging: boolean;
  hasData: boolean;
  hasDateRange: boolean;

  // Handlers
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearDatabase: () => void;
  onExportCSV: () => void;
  onDragEnter: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => Promise<void>;
}

export function UploadSection({
  isUploading,
  uploadError,
  isDragging,
  hasData,
  hasDateRange,
  onFileUpload,
  onClearDatabase,
  onExportCSV,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop
}: UploadSectionProps) {
  return (
    <section
      id="upload-section"
      className={`bg-card rounded-lg shadow-md p-4 sm:p-6 mb-8 transition-all duration-200 hover:shadow-lg ${
        isDragging ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
      }`}
      aria-label="Data upload section"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <h2 className="text-[1.25rem] sm:text-2xl font-bold mb-4">
        {hasData ? "Manage Data" : "Upload Data"}
      </h2>

      {isDragging && (
        <div className="mb-4 p-4 border-2 border-dashed border-primary rounded-lg bg-primary/10 text-center">
          <p className="text-lg font-medium text-primary">Drop your JSON file here</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <label
          className={`bg-primary text-primary-foreground font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[${UI_DIMENSIONS.minButtonHeight}px] ${
            isUploading
              ? "opacity-50 cursor-not-allowed pointer-events-none"
              : "hover:bg-primary/90 cursor-pointer"
          }`}
        >
          <Upload size={18} />
          {hasData ? "Upload New JSON File" : "Upload JSON File"}
          <input
            id="file-upload-input"
            type="file"
            accept=".json"
            onChange={onFileUpload}
            className="hidden"
            disabled={isUploading}
            aria-label="Upload JSON file"
          />
        </label>

        {isUploading && (
          <span className="text-muted-foreground flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Processing...
          </span>
        )}

        {hasData && (
          <>
            <button
              type="button"
              onClick={onClearDatabase}
              className={`bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[${UI_DIMENSIONS.minButtonHeight}px]`}
              aria-label="Clear all data from database"
            >
              <Trash2 size={18} />
              Clear Database
            </button>

            {hasDateRange && (
              <button
                type="button"
                onClick={onExportCSV}
                className={`bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 sm:py-2 rounded transition-colors flex items-center gap-2 min-h-[${UI_DIMENSIONS.minButtonHeight}px]`}
                aria-label="Export data as CSV file"
              >
                <Download size={18} />
                Export CSV
              </button>
            )}
          </>
        )}
      </div>

      {uploadError && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded text-destructive">
          {uploadError}
        </div>
      )}
    </section>
  );
}
