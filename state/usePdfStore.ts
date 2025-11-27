"use client";

import { create } from "zustand";
import { produce } from "immer";
import {
  apiClient,
  createFormData,
  createProgressHandler,
} from "@/lib/api/client";
import type {
  MergePdfOptions,
  SplitPdfOptions,
  FillPdfFormOptions,
} from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface PdfState {
  type: "pdf";
  file: File | null;
  files: File[];
  resultUrl: string | null;
  uploadProgress: number;
  processingProgress: number;
  isProcessing: boolean;
  error: string | null;
}

interface PdfActions {
  setFile: (file: File | null) => void;
  setFiles: (files: File[]) => void;
  setResultUrl: (url: string | null) => void;
  setUploadProgress: (progress: number) => void;
  setProcessingProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  mergePdfs: (options: MergePdfOptions) => Promise<void>;
  splitPdf: (options: SplitPdfOptions) => Promise<void>;
  fillPdfForm: (options: FillPdfFormOptions) => Promise<void>;
  reset: () => void;
}

const initialState: PdfState = {
  type: "pdf",
  file: null,
  files: [],
  resultUrl: null,
  uploadProgress: 0,
  processingProgress: 0,
  isProcessing: false,
  error: null,
};

export const usePdfStore = create<PdfState & PdfActions>((set, get) => ({
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

  setFiles: (files) =>
    set(
      produce((state) => {
        if (state.resultUrl) {
          URL.revokeObjectURL(state.resultUrl);
        }
        state.files = files;
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

  mergePdfs: async (options) => {
    if (options.files.length < 2) {
      set(
        produce((draft) => {
          draft.error = "Please select at least 2 PDF files";
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
      const formData = new FormData();
      options.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await apiClient.post("/files/pdf/merge", formData, {
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
        type: response.headers["content-type"] || "application/pdf",
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
      const errorMessage = extractErrorMessage(error, "Failed to merge PDFs");
      set(
        produce((draft) => {
          draft.isProcessing = false;
          draft.error = errorMessage;
        }),
      );
      throw error;
    }
  },

  splitPdf: async (options) => {
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
        ...(options.splitFrom !== undefined && {
          splitFrom: options.splitFrom,
        }),
        ...(options.splitTo !== undefined && { splitTo: options.splitTo }),
        ...(options.splitAt && { splitAt: options.splitAt }),
      });

      const response = await apiClient.post("/files/pdf/split", formData, {
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
        type: response.headers["content-type"] || "application/pdf",
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
      const errorMessage = extractErrorMessage(error, "Failed to split PDF");
      set(
        produce((draft) => {
          draft.isProcessing = false;
          draft.error = errorMessage;
        }),
      );
      throw error;
    }
  },

  fillPdfForm: async (options) => {
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
        formData: options.formData,
      });

      const response = await apiClient.post("/files/pdf/fill-form", formData, {
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
        type: response.headers["content-type"] || "application/pdf",
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
        "Failed to fill PDF form",
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
}));
