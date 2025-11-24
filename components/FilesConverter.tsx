"use client";

import { useState, useCallback } from "react";
import { useFilesStore } from "@/state/useFilesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { toast } from "sonner";
import {
  FileText,
  File,
  FileSpreadsheet,
  Archive,
  Upload,
  Loader2,
  FileDown,
  Download,
} from "lucide-react";

const SUPPORTED_FORMATS = [
  { name: "PDF", icon: FileText, color: "bg-red-500" },
  { name: "Word", icon: FileText, color: "bg-blue-500" },
  { name: "Excel", icon: FileSpreadsheet, color: "bg-green-500" },
  { name: "PowerPoint", icon: File, color: "bg-orange-500" },
  { name: "Archive", icon: Archive, color: "bg-yellow-500" },
  { name: "Text", icon: FileText, color: "bg-gray-500" },
];

// Map display names to actual format strings
const formatMap: Record<string, string> = {
  word: "docx",
  pdf: "pdf",
  excel: "xlsx",
  powerpoint: "pptx",
  archive: "zip",
  text: "txt",
};

export function FilesConverter() {
  const { file, setFile, convertFile, isConverting, resultUrl, reset } =
    useFilesStore();
  const [selectedFormat, setSelectedFormat] = useState<string>("");

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

  const getTargetFormat = (displayName: string): string => {
    const normalized = displayName.toLowerCase();
    return formatMap[normalized] || normalized;
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    if (!selectedFormat) {
      toast.error("Please select a target format");
      return;
    }

    try {
      const targetFormat = getTargetFormat(selectedFormat);
      await convertFile({
        targetFormat,
      });
      toast.success("File converted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to convert file";
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl && file) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const originalName = file.name.split(".")[0];
      const targetFormat = getTargetFormat(selectedFormat);
      link.download = `${originalName}.${targetFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setSelectedFormat("");
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dropzone
            onDrop={handleDrop}
            maxSize={200 * 1024 * 1024}
            disabled={isConverting}
            className="min-h-[200px]"
          />
          {file && (
            <div className="mt-4 space-y-2">
              <p className="text-muted-foreground text-sm">
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supported Formats Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Supported Formats</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SUPPORTED_FORMATS.map((format) => {
            const Icon = format.icon;
            const isSelected =
              selectedFormat.toLowerCase() === format.name.toLowerCase();
            return (
              <Card
                key={format.name}
                className={`hover:border-primary cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedFormat(format.name)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`${format.color} rounded-lg p-3 text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{format.name}</p>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Convert Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleConvert}
            disabled={!file || !selectedFormat || isConverting}
            className="w-full"
            size="lg"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Convert File
              </>
            )}
          </Button>
          {file && selectedFormat && !resultUrl && (
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Converting {file.name} to {selectedFormat} format
            </p>
          )}
        </CardContent>
      </Card>

      {/* Download Section */}
      {resultUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Conversion Complete!</p>
                <p className="text-muted-foreground text-sm">
                  Your file has been converted to {selectedFormat.toUpperCase()}
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
