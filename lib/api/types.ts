// Image conversion types
export type ImageFormat = "jpeg" | "png" | "webp" | "avif" | "tiff" | "bmp";

export interface ConvertImageOptions {
  format: ImageFormat;
  width?: number;
  height?: number;
  quality?: number;
  removeBackground?: boolean;
}

// 3D conversion types
export type ThreeDFormat = "glb" | "obj" | "usdz";

export interface Convert3DOptions {
  format: ThreeDFormat;
  optimize?: boolean;
  compress?: boolean;
}

// File conversion types
export interface ConvertFileOptions {
  targetFormat: string;
  options?: string;
}
