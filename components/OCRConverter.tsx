"use client";

import { useState, useCallback } from "react";
import { useOCRStore } from "@/state/useOCRStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Scan, Loader2, FileText } from "lucide-react";
import Image from "next/image";
import type { OcrLanguage } from "@/lib/api/types";

const OCR_LANGUAGES: { value: OcrLanguage; label: string }[] = [
  { value: "eng", label: "English" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "spa", label: "Spanish" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "rus", label: "Russian" },
  { value: "chi_sim", label: "Chinese (Simplified)" },
  { value: "jpn", label: "Japanese" },
  { value: "kor", label: "Korean" },
  { value: "ara", label: "Arabic" },
];

export function OCRConverter() {
  const {
    file,
    resultText,
    resultJson,
    uploadProgress,
    processingProgress,
    isExtracting,
    error,
    setFile,
    extractText,
    reset,
  } = useOCRStore();

  const [language, setLanguage] = useState<OcrLanguage>("eng");
  const [outputFormat, setOutputFormat] = useState<"txt" | "json">("txt");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        toast.success("Image loaded successfully");
      }
    },
    [setFile],
  );

  const handleExtract = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    try {
      await extractText({
        language,
        outputFormat,
      });
      toast.success("Text extracted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extract text";
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultText) {
      const blob = new Blob([resultText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "extracted-text.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    reset();
    setLanguage("eng");
    setOutputFormat("txt");
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "image/*": [".png", ".jpg", ".jpeg", ".webp", ".tiff", ".bmp"],
              }}
              maxSize={200 * 1024 * 1024}
              disabled={isExtracting}
            />
            {previewUrl && (
              <div className="space-y-2">
                <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                {file && (
                  <p className="text-muted-foreground text-sm">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Section */}
        <Card>
          <CardHeader>
            <CardTitle>OCR Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as OcrLanguage)}
              >
                {OCR_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <div className="flex gap-2">
                <Button
                  variant={outputFormat === "txt" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("txt")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Text
                </Button>
                <Button
                  variant={outputFormat === "json" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("json")}
                >
                  JSON
                </Button>
              </div>
            </div>

            <Button
              onClick={handleExtract}
              disabled={!file || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Scan className="mr-2 h-4 w-4" />
                  Extract Text
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {(isExtracting || uploadProgress > 0 || processingProgress > 0) && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Processing Progress</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {(resultText || resultJson) && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outputFormat === "json" && resultJson ? (
              <div className="space-y-2">
                <div className="bg-muted rounded-md p-4">
                  <pre className="text-sm">
                    {JSON.stringify(resultJson, null, 2)}
                  </pre>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    Confidence: {resultJson.confidence.toFixed(2)}%
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="bg-muted rounded-md p-4">
                <p className="text-sm whitespace-pre-wrap">{resultText}</p>
              </div>
            )}
            <div className="flex gap-2">
              {resultText && (
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Text
                </Button>
              )}
              <Button onClick={handleReset} variant="ghost">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
