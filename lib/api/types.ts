// Image conversion types
export type ImageFormat =
  | "jpeg"
  | "png"
  | "webp"
  | "avif"
  | "tiff"
  | "bmp"
  | "svg";

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

// Media conversion types
export type VideoFormat = "mp4" | "webm" | "avi" | "mov" | "mkv" | "gif";
export type AudioFormat = "mp3" | "wav" | "ogg" | "flac" | "aac" | "m4a";

export interface ConvertMediaOptions {
  targetFormat: string;
  videoCodec?: string;
  audioCodec?: string;
  audioBitrate?: string;
  videoBitrate?: string;
  width?: number;
  height?: number;
}

export interface ExtractAudioOptions {
  format: "mp3" | "wav" | "aac" | "flac";
}

// QR Code & Barcode types
export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface GenerateQrOptions {
  data: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: QrErrorCorrectionLevel;
}

export type BarcodeFormat =
  | "CODE128"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "CODE39"
  | "ITF14"
  | "MSI"
  | "pharmacode";

export interface GenerateBarcodeOptions {
  data: string;
  format: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
}

// Archive types
export type ArchiveFormat = "zip" | "tar" | "tar.gz";

export interface CreateArchiveOptions {
  format: ArchiveFormat;
  compressionLevel?: number;
}

// Markdown types
export type MarkdownFormat = "html" | "pdf";

export interface ConvertMarkdownOptions {
  targetFormat: MarkdownFormat;
}

// OCR types
export type OcrLanguage =
  | "eng"
  | "fra"
  | "deu"
  | "spa"
  | "ita"
  | "por"
  | "rus"
  | "chi_sim"
  | "jpn"
  | "kor"
  | "ara";

export interface ExtractTextOptions {
  language?: OcrLanguage;
  outputFormat?: "txt" | "json";
}

export type CodeLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "csharp"
  | "cpp"
  | "go"
  | "rust"
  | "php"
  | "ruby"
  | "html"
  | "css"
  | "json"
  | "sql";

export interface FormatCodeOptions {
  language?: CodeLanguage;
  outputFormat?: "formatted" | "html";
}
