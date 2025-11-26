"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { ConvertImageOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface ImageState {
  type: "image";
  file: File | null;
  previewBefore: string | null;
  previewAfter: string | null;
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isConverting: boolean;
  error: string | null;
  options: ConvertImageOptions | null;
}

interface ImageActions {
  setFile: (file: File | null) => void;
  setPreviewBefore: (url: string | null) => void;
  setPreviewAfter: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  convertImage: (options: ConvertImageOptions) => Promise<void>;
  reset: () => void;
}

const initialState: ImageState = {
  type: "image",
  file: null,
  previewBefore: null,
  previewAfter: null,
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isConverting: false,
  error: null,
  options: null,
};

export const useImagesStore = create<ImageState & ImageActions>((set, get) => ({
  ...initialState,

  setFile: (file) =>
    set(
      produce((state) => {
        // Revoke old preview URLs
        if (state.previewBefore) {
          URL.revokeObjectURL(state.previewBefore);
        }
        if (state.previewAfter) {
          URL.revokeObjectURL(state.previewAfter);
        }
        if (state.resultUrl) {
          URL.revokeObjectURL(state.resultUrl);
        }

        state.file = file;
        state.previewBefore = file ? URL.createObjectURL(file) : null;
        state.previewAfter = null;
        state.resultUrl = null;
        state.error = null;
        state.uploadProgress = 0;
        state.processingProgress = 0;
      }),
    ),

  setPreviewBefore: (url) =>
    set(
      produce((state) => {
        if (state.previewBefore) {
          URL.revokeObjectURL(state.previewBefore);
        }
        state.previewBefore = url;
      }),
    ),

  setPreviewAfter: (url) =>
    set(
      produce((state) => {
        if (state.previewAfter) {
          URL.revokeObjectURL(state.previewAfter);
        }
        state.previewAfter = url;
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

  convertImage: async (options) => {
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
        format: options.format,
        ...(options.width && { width: options.width }),
        ...(options.height && { height: options.height }),
        ...(options.quality && { quality: options.quality }),
        ...(options.removeBackground !== undefined && {
          removeBackground: options.removeBackground,
        }),
        ...(options.colorVectorization !== undefined && {
          colorVectorization: options.colorVectorization,
        }),
      });

      const response = await apiClient.post("/api/images/convert", formData, {
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
        type: response.headers["content-type"] || "image/png",
      });
      const resultUrl = URL.createObjectURL(blob);

      set(
        produce((draft) => {
          draft.resultUrl = resultUrl;
          draft.previewAfter = resultUrl;
          draft.isConverting = false;
          draft.uploadProgress = 100;
          draft.processingProgress = 100;
        }),
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to convert image",
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
        if (state.previewBefore) {
          URL.revokeObjectURL(state.previewBefore);
        }
        if (state.previewAfter) {
          URL.revokeObjectURL(state.previewAfter);
        }
        if (state.resultUrl) {
          URL.revokeObjectURL(state.resultUrl);
        }
        Object.assign(state, initialState);
      }),
    ),
}));
