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
export type ThreeDFormat =
  | "glb"
  | "gltf"
  | "obj"
  | "usdz"
  | "fbx"
  | "stl"
  | "ply";

export interface Convert3DOptions {
  format: ThreeDFormat;
  optimize?: boolean;
  compress?: boolean;
}

export interface Extract3DDataOptions {
  extractType: "textures" | "animations" | "materials";
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

// PDF Operations types
export interface MergePdfOptions {
  files: File[];
}

export interface SplitPdfOptions {
  splitFrom?: number;
  splitTo?: number;
  splitAt?: string; // Comma-separated page numbers
}

export interface FillPdfFormOptions {
  formData: string; // JSON string
}

// Excel Operations types
export interface ExportExcelChartOptions {
  sheetName?: string;
  chartIndex?: number;
}

// Presentations types
export interface SlideData {
  title: string;
  content?: string;
  bullets?: string[];
}

export interface CreatePresentationOptions {
  title: string;
  slides: SlideData[];
}

export type PresentationTargetFormat = "pdf" | "png" | "jpeg";

export interface ConvertPresentationOptions {
  targetFormat: PresentationTargetFormat;
}

// Ebooks types
export type EbookSourceFormat = "html" | "txt";

export interface CreateEbookOptions {
  title: string;
  author: string;
  content: string;
  sourceFormat: EbookSourceFormat;
}

export type EbookTargetFormat = "pdf" | "html" | "txt";

export interface ConvertEbookOptions {
  targetFormat: EbookTargetFormat;
}

// Video Enhancement types
export interface GenerateThumbnailOptions {
  time?: number;
  format?: "png" | "jpeg";
}

export interface TrimVideoOptions {
  startTime: number;
  endTime: number;
  targetFormat?: string;
}

export interface MergeVideosOptions {
  files: File[];
}

export interface ExtractFrameOptions {
  time?: number;
  frameNumber?: number;
  format?: "png" | "jpeg";
}

export interface SubtitleOperationOptions {
  operation: "extract" | "embed";
  subtitleFile?: File;
  subtitleText?: string;
  format?: "srt" | "vtt" | "ass";
}
