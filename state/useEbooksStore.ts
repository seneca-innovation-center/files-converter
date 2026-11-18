"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { CreateEbookOptions, ConvertEbookOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface EbooksState {
  type: "ebooks";
  file: File | null;
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isProcessing: boolean;
  error: string | null;
}

interface EbooksActions {
  setFile: (file: File | null) => void;
  setResultUrl: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  createEbook: (options: CreateEbookOptions) => Promise<void>;
  convertEbook: (options: ConvertEbookOptions) => Promise<void>;
  reset: () => void;
}

const initialState: EbooksState = {
  type: "ebooks",
  file: null,
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isProcessing: false,
  error: null,
};

export const useEbooksStore = create<EbooksState & EbooksActions>(
  (set, get) => ({
    ...initialState,

    setFile: (file) =>
      set(
        produce((state) => {
          if (state.resultUrl) {
            URL.revokeObjectURL(state.resultUrl);
          }
          state.file = file;
          state.resultUrl = null;
          state.error = null;
          state.uploadProgress = 0;
          state.processingProgress = 0;
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

    createEbook: async (options) => {
      set(
        produce((draft) => {
          draft.isProcessing = true;
          draft.error = null;
          draft.uploadProgress = 0;
          draft.processingProgress = 0;
        }),
      );

      try {
        const response = await apiClient.post("/ebooks/create", options, {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
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
            "application/epub+zip",
        });
        const resultUrl = URL.createObjectURL(blob);

        set(
          produce((draft) => {
            draft.resultUrl = resultUrl;
            draft.isProcessing = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(
          error,
          "Failed to create ebook",
        );
        set(
          produce((draft) => {
            draft.isProcessing = false;
            draft.error = errorMessage;
          }),
        );
        throw error;
      }
    },

    convertEbook: async (options) => {
      const state = get();
      if (!state.file) {
        set(
          produce((draft) => {
            draft.error = "No file selected";
          }),
        );
        return;
      }

      set(
        produce((draft) => {
          draft.isProcessing = true;
          draft.error = null;
          draft.uploadProgress = 0;
          draft.processingProgress = 0;
        }),
      );

      try {
        const formData = createFormData(state.file, {
          targetFormat: options.targetFormat,
        });

        const response = await apiClient.post("/ebooks/convert", formData, {
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
            "application/pdf",
        });
        const resultUrl = URL.createObjectURL(blob);

        set(
          produce((draft) => {
            draft.resultUrl = resultUrl;
            draft.isProcessing = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(
          error,
          "Failed to convert ebook",
        );
        set(
          produce((draft) => {
            draft.isProcessing = false;
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
