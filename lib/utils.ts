import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Extracts error message from axios error response
 * Prioritizes backend error message over axios generic message
 * The axios interceptor converts blob error responses to JSON automatically
 */
export function extractErrorMessage(
  error: unknown,
  defaultMessage: string,
): string {
  if (error && typeof error === "object") {
    const axiosError = error as {
      response?: {
        data?: { message?: string; statusCode?: number };
        status?: number;
      };
      message?: string;
    };

    // Check for backend error message (converted from blob by interceptor if needed)
    if (
      axiosError.response?.data &&
      typeof axiosError.response.data === "object" &&
      "message" in axiosError.response.data &&
      typeof axiosError.response.data.message === "string"
    ) {
      return axiosError.response.data.message;
    }

    // Fall back to axios error message
    if (axiosError.message) {
      return axiosError.message;
    }
  }

  // Fall back to Error.message if it's an Error instance
  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
