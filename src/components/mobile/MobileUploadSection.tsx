/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

"use client";

import { Download, Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";

interface MobileUploadSectionProps {
  isUploading: boolean;
  uploadError: string | null;
  hasData: boolean;
  hasDateRange: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearDatabase: () => void;
  onExportCSV: () => void;
  isDragging: boolean;
  onDragEnter: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

/**
 * Renders a mobile-friendly section for uploading, managing, and exporting data files.
 *
 * Provides controls for uploading JSON files, clearing loaded data, and exporting data as CSV (if a date range is present). Supports drag-and-drop file uploads and displays upload progress and error messages. The section can be expanded or collapsed by the user.
 *
 * @param isUploading - Whether a file upload is currently in progress
 * @param uploadError - Error message to display if the upload fails
 * @param hasData - Indicates if data has already been loaded
 * @param hasDateRange - Indicates if the loaded data includes a date range (enables CSV export)
 * @param onFileUpload - Callback invoked when a file is selected for upload
 * @param onClearDatabase - Callback invoked to clear all loaded data
 * @param onExportCSV - Callback invoked to export data as a CSV file
 * @param isDragging - Whether a file is currently being dragged over the section
 * @param onDragEnter - Handler for drag enter events
 * @param onDragOver - Handler for drag over events
 * @param onDragLeave - Handler for drag leave events
 * @param onDrop - Handler for drop events
 */
export function MobileUploadSection({
  isUploading,
  uploadError,
  hasData,
  hasDateRange,
  onFileUpload,
  onClearDatabase,
  onExportCSV,
  isDragging,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop
}: MobileUploadSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="upload-section"
      className={`bg-card rounded-lg shadow-sm mb-4 transition-all duration-200 ${
        isDragging ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""
      }`}
      aria-label="Data upload section"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <Upload className="h-[18px] w-[18px] text-muted-foreground" />
          <h2 className="text-base font-semibold">{hasData ? "Manage Data" : "Upload Data"}</h2>
          {hasData && (
            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Loaded
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>Toggle upload section</title>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="px-3 pb-3 border-t border-border/50">
          {isDragging && (
            <div className="mt-3 p-3 border-2 border-dashed border-primary rounded-lg bg-primary/10 text-center">
              <p className="text-sm font-medium text-primary">Drop your JSON file here</p>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <label
              className={`flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-2.5 px-4 rounded-md transition-colors w-full text-sm ${
                isUploading
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : "hover:bg-primary/90 cursor-pointer"
              }`}
            >
              <Upload className="h-4 w-4" />
              {hasData ? "Upload New JSON File" : "Upload JSON File"}
              <input
                type="file"
                accept=".json"
                onChange={onFileUpload}
                className="hidden"
                disabled={isUploading}
                aria-label="Upload JSON file"
              />
            </label>

            {isUploading && (
              <div className="text-center">
                <span className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              </div>
            )}

            {hasData && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClearDatabase}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium py-2.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 text-sm"
                  aria-label="Clear all data from database"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
                {hasDateRange && (
                  <button
                    type="button"
                    onClick={onExportCSV}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-3 rounded-md transition-colors flex items-center justify-center gap-1.5 text-sm"
                    aria-label="Export data as CSV file"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                )}
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {uploadError}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
