"use client";

import { create } from "zustand";
import { produce } from "immer";
import { apiClient, createProgressHandler } from "@/lib/api/client";
import type { CreateArchiveOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface ArchiveState {
  type: "archive";
  files: File[];
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isCreating: boolean;
  error: string | null;
  options: CreateArchiveOptions | null;
}

interface ArchiveActions {
  setFiles: (files: File[]) => void;
  setResultUrl: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  createArchive: (options: CreateArchiveOptions) => Promise<void>;
  reset: () => void;
}

const initialState: ArchiveState = {
  type: "archive",
  files: [],
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isCreating: false,
  error: null,
  options: null,
};

export const useArchiveStore = create<ArchiveState & ArchiveActions>(
  (set, get) => ({
    ...initialState,

    setFiles: (files) =>
      set(
        produce((state) => {
          state.files = files;
          state.error = null;
        }),
      ),

    setResultUrl: (url) =>
      set(
        produce((state) => {
          if (state.resultUrl) {
            URL.revokeObjectURL(state.resultUrl);
          }
          state.resultUrl = url;
        }),
      ),

    setUploadProgress: (progress) =>
      set(
        produce((state) => {
          state.uploadProgress = progress;
        }),
      ),

    setProcessingProgress: (progress) =>
      set(
        produce((state) => {
          state.processingProgress = progress;
        }),
      ),

    setError: (error) =>
      set(
        produce((state) => {
          state.error = error;
        }),
      ),

    createArchive: async (options) => {
      const state = get();
      if (state.files.length === 0) {
        set(
          produce((draft) => {
            draft.error = "No files selected";
          }),
        );
        return;
      }

      set(
        produce((draft) => {
          draft.isCreating = true;
          draft.error = null;
          draft.uploadProgress = 0;
          draft.processingProgress = 0;
          draft.options = options;
        }),
      );

      try {
        const formData = new FormData();
        state.files.forEach((file) => {
          formData.append("files", file);
        });
        formData.append("format", options.format);
        if (options.compressionLevel !== undefined) {
          formData.append(
            "compressionLevel",
            options.compressionLevel.toString(),
          );
        }

        const response = await apiClient.post("/archives/create", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
          onUploadProgress: createProgressHandler((progress) => {
            set(
              produce((draft) => {
                draft.uploadProgress = progress.percentage;
              }),
            );
          }),
          onDownloadProgress: createProgressHandler((progress) => {
            set(
              produce((draft) => {
                draft.processingProgress = progress.percentage;
              }),
            );
          }),
        });

        const blob = new Blob([response.data], {
          type:
            (response.headers["content-type"] as string | undefined) ||
            "application/zip",
        });
        const resultUrl = URL.createObjectURL(blob);

        set(
          produce((draft) => {
            draft.resultUrl = resultUrl;
            draft.isCreating = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(
          error,
          "Failed to create archive",
        );
        set(
          produce((draft) => {
            draft.isCreating = false;
            draft.error = errorMessage;
          }),
        );
        throw error;
      }
    },

    reset: () =>
      set(
        produce((state) => {
          if (state.resultUrl) {
            URL.revokeObjectURL(state.resultUrl);
          }
          Object.assign(state, initialState);
        }),
      ),
  }),
);
