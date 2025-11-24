"use client";

import { useState, useCallback } from "react";
import { useMarkdownStore } from "@/state/useMarkdownStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, FileText, Loader2, FileDown, Code } from "lucide-react";
import type { MarkdownFormat } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

const MARKDOWN_FORMATS: MarkdownFormat[] = ["html", "pdf"];

export function MarkdownConverter() {
  const {
    file,
    resultUrl,
    uploadProgress,
    processingProgress,
    isConverting,
    error,
    setFile,
    convertMarkdown,
    htmlToMarkdown,
    reset,
  } = useMarkdownStore();

  const [mode, setMode] = useState<"convert" | "html-to-md">("convert");
  const [targetFormat, setTargetFormat] = useState<MarkdownFormat>("html");

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("File loaded successfully");
      }
    },
    [setFile],
  );

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    if (mode === "convert") {
      try {
        await convertMarkdown({
          targetFormat,
        });
        toast.success("Markdown converted successfully!");
      } catch (err) {
        const errorMessage = extractErrorMessage(
          err,
          "Failed to convert markdown",
        );
        toast.error(errorMessage);
      }
    } else {
      try {
        await htmlToMarkdown();
        toast.success("HTML converted to Markdown successfully!");
      } catch (err) {
        const errorMessage = extractErrorMessage(
          err,
          "Failed to convert HTML to markdown",
        );
        toast.error(errorMessage);
      }
    }
  };

  const handleDownload = () => {
    if (resultUrl && file) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const originalName = file.name.split(".")[0];
      const extension =
        mode === "convert" ? (targetFormat === "pdf" ? "pdf" : "html") : "md";
      link.download = `${originalName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setMode("convert");
    setTargetFormat("html");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Upload File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "text/markdown": [".md"],
                "text/html": [".html", ".htm"],
              }}
              maxSize={200 * 1024 * 1024}
              disabled={isConverting}
            />
            {file && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Section */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "convert" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("convert")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Markdown → HTML/PDF
                </Button>
                <Button
                  variant={mode === "html-to-md" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("html-to-md")}
                >
                  <Code className="mr-2 h-4 w-4" />
                  HTML → Markdown
                </Button>
              </div>
            </div>

            {mode === "convert" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Format</label>
                  <div className="flex flex-wrap gap-2">
                    {MARKDOWN_FORMATS.map((f) => (
                      <Badge
                        key={f}
                        variant={targetFormat === f ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setTargetFormat(f)}
                      >
                        {f.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleConvert}
              disabled={!file || isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  {mode === "convert"
                    ? `Convert to ${targetFormat.toUpperCase()}`
                    : "Convert to Markdown"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {(isConverting || uploadProgress > 0 || processingProgress > 0) && (
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

      {/* Download Section */}
      {resultUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conversion Complete!</p>
                <p className="text-muted-foreground text-sm">
                  Your file has been converted successfully
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button onClick={handleReset} variant="ghost">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
