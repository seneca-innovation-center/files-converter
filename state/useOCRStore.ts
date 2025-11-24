"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { ExtractTextOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface OCRState {
  type: "ocr";
  file: File | null;
  resultText: string | null;
  resultJson: { text: string; confidence: number } | null;
  uploadProgress: number;
  processingProgress: number;
  isExtracting: boolean;
  error: string | null;
  options: ExtractTextOptions | null;
}

interface OCRActions {
  setFile: (file: File | null) => void;
  setResultText: (text: string | null) => void;
  setResultJson: (json: { text: string; confidence: number } | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  extractText: (options: ExtractTextOptions) => Promise<void>;
  reset: () => void;
}

const initialState: OCRState = {
  type: "ocr",
  file: null,
  resultText: null,
  resultJson: null,
  uploadProgress: 0,
  processingProgress: 0,
  isExtracting: false,
  error: null,
  options: null,
};

export const useOCRStore = create<OCRState & OCRActions>((set, get) => ({
  ...initialState,

  setFile: (file) =>
    set(
      produce((state) => {
        state.file = file;
        state.resultText = null;
        state.resultJson = null;
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

  setResultJson: (json) =>
    set(
      produce((state) => {
        state.resultJson = json;
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

  extractText: async (options) => {
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
        draft.isExtracting = true;
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

      const response = await apiClient.post("/api/ocr/extract", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: options.outputFormat === "json" ? "json" : "text",
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

      if (options.outputFormat === "json") {
        set(
          produce((draft) => {
            draft.resultJson = response.data;
            draft.isExtracting = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      } else {
        set(
          produce((draft) => {
            draft.resultText = response.data;
            draft.isExtracting = false;
            draft.uploadProgress = 100;
            draft.processingProgress = 100;
          }),
        );
      }
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error, "Failed to extract text");
      set(
        produce((draft) => {
          draft.isExtracting = false;
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
