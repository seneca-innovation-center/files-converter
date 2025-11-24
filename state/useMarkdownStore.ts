"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { ConvertMarkdownOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface MarkdownState {
  type: "markdown";
  file: File | null;
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isConverting: boolean;
  error: string | null;
  options: ConvertMarkdownOptions | null;
}

interface MarkdownActions {
  setFile: (file: File | null) => void;
  setResultUrl: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  convertMarkdown: (options: ConvertMarkdownOptions) => Promise<void>;
  htmlToMarkdown: () => Promise<void>;
  reset: () => void;
}

const initialState: MarkdownState = {
  type: "markdown",
  file: null,
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isConverting: false,
  error: null,
  options: null,
};

export const useMarkdownStore = create<MarkdownState & MarkdownActions>(
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

    convertMarkdown: async (options) => {
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
          draft.isConverting = true;
          draft.error = null;
          draft.uploadProgress = 0;
          draft.processingProgress = 0;
          draft.options = options;
        }),
      );

      try {
        const formData = createFormData(state.file, {
          targetFormat: options.targetFormat,
        });

        const response = await apiClient.post(
          "/api/markdown/convert",
          formData,
          {
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
          },
        );

        const blob = new Blob([response.data], {
          type:
            response.headers["content-type"] ||
            (options.targetFormat === "pdf" ? "application/pdf" : "text/html"),
        });
        const resultUrl = URL.createObjectURL(blob);

        set(
          produce((draft) => {
            draft.resultUrl = resultUrl;
            draft.isConverting = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(
          error,
          "Failed to convert markdown",
        );
        set(
          produce((draft) => {
            draft.isConverting = false;
            draft.error = errorMessage;
          }),
        );
        throw error;
      }
    },

    htmlToMarkdown: async () => {
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
          draft.isConverting = true;
          draft.error = null;
          draft.uploadProgress = 0;
          draft.processingProgress = 0;
        }),
      );

      try {
        const formData = createFormData(state.file, {});

        const response = await apiClient.post(
          "/api/markdown/html-to-markdown",
          formData,
          {
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
          },
        );

        const blob = new Blob([response.data], {
          type: response.headers["content-type"] || "text/markdown",
        });
        const resultUrl = URL.createObjectURL(blob);

        set(
          produce((draft) => {
            draft.resultUrl = resultUrl;
            draft.isConverting = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } catch (error: unknown) {
        const errorMessage = extractErrorMessage(
          error,
          "Failed to convert HTML to markdown",
        );
        set(
          produce((draft) => {
            draft.isConverting = false;
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
