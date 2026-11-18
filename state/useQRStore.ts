"use client";

import { create } from "zustand";
import { produce } from "immer";
import { apiClient } from "@/lib/api/client";
import type {
  GenerateQrOptions,
  GenerateBarcodeOptions,
} from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

export interface QRState {
  type: "qr";
  resultUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  options: GenerateQrOptions | GenerateBarcodeOptions | null;
}

interface QRActions {
  setResultUrl: (url: string | null) => void;
  setError: (error: string | null) => void;
  generateQR: (options: GenerateQrOptions) => Promise<void>;
  generateBarcode: (options: GenerateBarcodeOptions) => Promise<void>;
  reset: () => void;
}

const initialState: QRState = {
  type: "qr",
  resultUrl: null,
  isGenerating: false,
  error: null,
  options: null,
};

export const useQRStore = create<QRState & QRActions>((set) => ({
  ...initialState,

  setResultUrl: (url) =>
    set(
      produce((state) => {
        if (state.resultUrl) {
          URL.revokeObjectURL(state.resultUrl);
        }
        state.resultUrl = url;
      }),
    ),

  setError: (error) =>
    set(
      produce((state) => {
        state.error = error;
      }),
    ),

  generateQR: async (options) => {
    set(
      produce((draft) => {
        draft.isGenerating = true;
        draft.error = null;
        draft.options = options;
      }),
    );

    try {
      const response = await apiClient.post("/qr/generate", options, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          (response.headers["content-type"] as string | undefined) ||
          "image/png",
      });
      const resultUrl = URL.createObjectURL(blob);

      set(
        produce((draft) => {
          draft.resultUrl = resultUrl;
          draft.isGenerating = false;
        }),
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to generate QR code",
      );
      set(
        produce((draft) => {
          draft.isGenerating = false;
          draft.error = errorMessage;
        }),
      );
      throw error;
    }
  },

  generateBarcode: async (options) => {
    set(
      produce((draft) => {
        draft.isGenerating = true;
        draft.error = null;
        draft.options = options;
      }),
    );

    try {
      const response = await apiClient.post("/qr/barcode", options, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          (response.headers["content-type"] as string | undefined) ||
          "image/png",
      });
      const resultUrl = URL.createObjectURL(blob);

      set(
        produce((draft) => {
          draft.resultUrl = resultUrl;
          draft.isGenerating = false;
        }),
      );
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(
        error,
        "Failed to generate barcode",
      );
      set(
        produce((draft) => {
          draft.isGenerating = false;
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
