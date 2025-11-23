"use client";

import axios, { AxiosProgressEvent } from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  timeout: 300000, // 5 minutes for large file conversions
});

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function createFormData(
  file: File,
  fields: Record<string, string | number | boolean>
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
  onProgress: (progress: UploadProgress) => void
) {
  return (progressEvent: AxiosProgressEvent) => {
    if (progressEvent.total) {
      const percentage = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress({
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percentage,
      });
    }
  };
}
