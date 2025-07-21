/**
 * Notso AI - A web dashboard for visualizing chatbot conversation analytics
 * Copyright (C) 2025  Kaj Kowalski
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import type { ChatSession } from "@/lib/types/session";
import { validateSessionData } from "@/lib/validation/schema";

interface UseFileUploadOptions {
  onSuccess?: (count: number) => void;
  onError?: (error: string) => void;
  acceptedFileTypes?: string[];
}

interface UseFileUploadReturn {
  isUploading: boolean;
  uploadError: string | null;
  isDragging: boolean;
  processFile: (file: File) => Promise<void>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDragEnter: (event: React.DragEvent) => void;
  handleDragLeave: (event: React.DragEvent) => void;
  handleDragOver: (event: React.DragEvent) => void;
  handleDrop: (event: React.DragEvent) => Promise<void>;
  triggerFileInput: () => void;
  clearError: () => void;
}

/**
 * Custom hook for file upload functionality with drag-and-drop support
 */
export function useFileUpload(
  loadSessionsFromJSON: (data: ChatSession[]) => Promise<number>,
  options: UseFileUploadOptions = {}
): UseFileUploadReturn {
  const { onSuccess, onError, acceptedFileTypes = [".json"] } = options;

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const processFile = useCallback(
    async (file: File) => {
      // Validate file type
      const isValidType = acceptedFileTypes.some((type) => {
        if (type.startsWith(".")) {
          return file.name.endsWith(type);
        }
        return file.type.includes(type);
      });

      if (!isValidType) {
        const error = `Please upload a valid file (${acceptedFileTypes.join(", ")})`;
        setUploadError(error);
        onError?.(error);
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const text = await file.text();
        const jsonData = JSON.parse(text);

        // Validate the data
        const validatedData = validateSessionData(jsonData);

        // Load into database
        const count = await loadSessionsFromJSON(validatedData);

        toast.success(`Successfully loaded ${count} sessions`);
        onSuccess?.(count);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load file";
        setUploadError(errorMessage);
        toast.error(errorMessage);
        onError?.(errorMessage);
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    },
    [acceptedFileTypes, loadSessionsFromJSON, onSuccess, onError]
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await processFile(file);
      // Clear the input
      event.target.value = "";
    },
    [processFile]
  );

  const handleDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current++;
    if (event.dataTransfer.items && event.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = Array.from(event.dataTransfer.files);
      const validFile = files.find((file) =>
        acceptedFileTypes.some((type) => {
          if (type.startsWith(".")) {
            return file.name.endsWith(type);
          }
          return file.type.includes(type);
        })
      );

      if (validFile) {
        await processFile(validFile);
      } else {
        const error = `Please drop a valid file (${acceptedFileTypes.join(", ")})`;
        setUploadError(error);
        onError?.(error);
      }
    },
    [acceptedFileTypes, processFile, onError]
  );

  const triggerFileInput = useCallback(() => {
    // Find and click the file input
    const fileInputs = document.querySelectorAll('input[type="file"]');
    for (const input of fileInputs) {
      const element = input as HTMLInputElement;
      // Check if the input accepts our file types and is not disabled
      const acceptAttr = element.getAttribute("accept");
      const matchesType = acceptedFileTypes.some((type) => acceptAttr?.includes(type));

      if (matchesType && !element.disabled && element.offsetParent !== null) {
        element.click();
        break;
      }
    }
  }, [acceptedFileTypes]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  return {
    isUploading,
    uploadError,
    isDragging,
    processFile,
    handleFileUpload,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    triggerFileInput,
    clearError
  };
}
