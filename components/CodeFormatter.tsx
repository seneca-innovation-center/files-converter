"use client";

import { useState, useCallback } from "react";
import { useCodeStore } from "@/state/useCodeStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Code, Loader2, FileDown, FileText } from "lucide-react";
import type { CodeLanguage } from "@/lib/api/types";

const CODE_LANGUAGES: CodeLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "cpp",
  "go",
  "rust",
  "php",
  "ruby",
  "html",
  "css",
  "json",
  "sql",
];

export function CodeFormatter() {
  const {
    file,
    resultText,
    uploadProgress,
    processingProgress,
    isFormatting,
    error,
    setFile,
    formatCode,
    reset,
  } = useCodeStore();

  const [language, setLanguage] = useState<CodeLanguage>("javascript");
  const [outputFormat, setOutputFormat] = useState<"formatted" | "html">(
    "formatted",
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Code file loaded successfully");
      }
    },
    [setFile],
  );

  const handleFormat = async () => {
    if (!file) {
      toast.error("Please select a code file first");
      return;
    }

    try {
      await formatCode({
        language,
        outputFormat,
      });
      toast.success("Code formatted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to format code";
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultText) {
      const blob = new Blob([resultText], {
        type: outputFormat === "html" ? "text/html" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `formatted.${outputFormat === "html" ? "html" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setLanguage("javascript");
    setOutputFormat("formatted");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Upload Code File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "text/*": [
                  ".js",
                  ".ts",
                  ".py",
                  ".java",
                  ".cs",
                  ".cpp",
                  ".go",
                  ".rs",
                  ".php",
                  ".rb",
                  ".html",
                  ".css",
                  ".json",
                  ".sql",
                ],
              }}
              maxSize={200 * 1024 * 1024}
              disabled={isFormatting}
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
            <CardTitle>Formatting Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <select
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <div className="flex gap-2">
                <Button
                  variant={outputFormat === "formatted" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("formatted")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Formatted Code
                </Button>
                <Button
                  variant={outputFormat === "html" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOutputFormat("html")}
                >
                  <Code className="mr-2 h-4 w-4" />
                  HTML (Syntax Highlighted)
                </Button>
              </div>
            </div>

            <Button
              onClick={handleFormat}
              disabled={!file || isFormatting}
              className="w-full"
            >
              {isFormatting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Formatting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Format Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {(isFormatting || uploadProgress > 0 || processingProgress > 0) && (
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
      {resultText && (
        <Card>
          <CardHeader>
            <CardTitle>Formatted Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {outputFormat === "html" ? (
              <div
                className="bg-muted rounded-md p-4"
                dangerouslySetInnerHTML={{ __html: resultText }}
              />
            ) : (
              <div className="bg-muted rounded-md p-4">
                <pre className="overflow-x-auto text-sm">
                  <code>{resultText}</code>
                </pre>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={handleDownload} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
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
