"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { FormatCodeOptions } from "@/lib/api/types";

export interface CodeState {
  type: "code";
  file: File | null;
  resultText: string | null;
  uploadProgress: number;
  processingProgress: number;
  isFormatting: boolean;
  error: string | null;
  options: FormatCodeOptions | null;
}

interface CodeActions {
  setFile: (file: File | null) => void;
  setResultText: (text: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  formatCode: (options: FormatCodeOptions) => Promise<void>;
  reset: () => void;
}

const initialState: CodeState = {
  type: "code",
  file: null,
  resultText: null,
  uploadProgress: 0,
  processingProgress: 0,
  isFormatting: false,
  error: null,
  options: null,
};

export const useCodeStore = create<CodeState & CodeActions>((set, get) => ({
  ...initialState,

  setFile: (file) =>
    set(
      produce((state) => {
        state.file = file;
        state.resultText = null;
        state.error = null;
        state.uploadProgress = 0;
        state.processingProgress = 0;
      }),
    ),

  setResultText: (text) =>
    set(
      produce((state) => {
        state.resultText = text;
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

  formatCode: async (options) => {
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
        draft.isFormatting = true;
        draft.error = null;
        draft.uploadProgress = 0;
        draft.processingProgress = 0;
        draft.options = options;
      }),
    );

    try {
      const formData = createFormData(state.file, {
        ...(options.language && { language: options.language }),
        ...(options.outputFormat && { outputFormat: options.outputFormat }),
      });

      const response = await apiClient.post("/api/code/format", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "text",
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

      set(
        produce((draft) => {
          draft.resultText = response.data;
          draft.isFormatting = false;
          draft.uploadProgress = 100;
          draft.processingProgress = 100;
        }),
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to format code";
      set(
        produce((draft) => {
          draft.isFormatting = false;
          draft.error = errorMessage;
        }),
      );
      throw error;
    }
  },

  reset: () =>
    set(
      produce((state) => {
        Object.assign(state, initialState);
      }),
    ),
}));
