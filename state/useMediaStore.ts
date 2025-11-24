"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type { ConvertMediaOptions, ExtractAudioOptions } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface MediaState {
  type: "media";
  file: File | null;
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isConverting: boolean;
  error: string | null;
  options: ConvertMediaOptions | ExtractAudioOptions | null;
}

interface MediaActions {
  setFile: (file: File | null) => void;
  setResultUrl: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  convertMedia: (options: ConvertMediaOptions) => Promise<void>;
  extractAudio: (options: ExtractAudioOptions) => Promise<void>;
  reset: () => void;
}

const initialState: MediaState = {
  type: "media",
  file: null,
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isConverting: false,
  error: null,
  options: null,
};

export const useMediaStore = create<MediaState & MediaActions>((set, get) => ({
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

  convertMedia: async (options) => {
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
        ...(options.videoCodec && { videoCodec: options.videoCodec }),
        ...(options.audioCodec && { audioCodec: options.audioCodec }),
        ...(options.audioBitrate && { audioBitrate: options.audioBitrate }),
        ...(options.videoBitrate && { videoBitrate: options.videoBitrate }),
        ...(options.width && { width: options.width }),
        ...(options.height && { height: options.height }),
      });

      const response = await apiClient.post("/api/media/convert", formData, {
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
        type: response.headers["content-type"] || "video/mp4",
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
        "Failed to convert media",
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

  extractAudio: async (options) => {
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
      });

      const response = await apiClient.post(
        "/api/media/extract-audio",
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
        type: response.headers["content-type"] || "audio/mpeg",
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
        "Failed to extract audio",
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
}));
