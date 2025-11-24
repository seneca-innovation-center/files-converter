"use client";

import axios, { AxiosProgressEvent } from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 300000, // 5 minutes for large file conversions
});

// Interceptor to convert blob error responses to JSON
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If error response is a blob, try to parse it as JSON
    // This handles cases where responseType is "blob" but errors are JSON
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        // Try to parse as JSON (backend errors are usually JSON)
        const json = JSON.parse(text);
        // Replace blob data with parsed JSON
        error.response.data = json;
      } catch {
        // If parsing fails, keep original blob
        // This might be a legitimate binary error response
      }
    }
    return Promise.reject(error);
  },
);

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function createFormData(
  file: File,
  fields: Record<string, string | number | boolean>,
): FormData {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return formData;
}

export function createProgressHandler(
  onProgress: (progress: UploadProgress) => void,
) {
  return (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percentage = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      onProgress({
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percentage,
      });
    }
  };
}
