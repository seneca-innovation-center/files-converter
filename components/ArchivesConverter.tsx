"use client";

import { useState, useCallback } from "react";
import { useArchiveStore } from "@/state/useArchiveStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Archive, Loader2, FileDown, X } from "lucide-react";
import type { ArchiveFormat } from "@/lib/api/types";

const ARCHIVE_FORMATS: ArchiveFormat[] = ["zip", "tar", "tar.gz"];

export function ArchivesConverter() {
  const {
    files,
    resultUrl,
    uploadProgress,
    processingProgress,
    isCreating,
    error,
    setFiles,
    createArchive,
    reset,
  } = useArchiveStore();

  const [format, setFormat] = useState<ArchiveFormat>("zip");
  const [compressionLevel, setCompressionLevel] = useState<number>(6);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles([...files, ...acceptedFiles]);
      toast.success(`${acceptedFiles.length} file(s) added`);
    },
    [files, setFiles],
  );

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  const handleCreate = async () => {
    if (files.length === 0) {
      toast.error("Please add files to archive");
      return;
    }

    try {
      await createArchive({
        format,
        compressionLevel,
      });
      toast.success("Archive created successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create archive";
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `archive.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setFormat("zip");
    setCompressionLevel(6);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Add Files to Archive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              maxSize={200 * 1024 * 1024}
              disabled={isCreating}
              multiple
            />
            {files.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {files.length} file(s) selected
                  </span>
                  <span className="text-muted-foreground">
                    {(totalSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {files.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between rounded-md border p-2 text-sm"
                    >
                      <span className="truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Section */}
        <Card>
          <CardHeader>
            <CardTitle>Archive Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Archive Format</label>
              <div className="flex flex-wrap gap-2">
                {ARCHIVE_FORMATS.map((f) => (
                  <Badge
                    key={f}
                    variant={format === f ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setFormat(f)}
                  >
                    {f.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            {format === "zip" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Compression Level
                    </label>
                    <span className="text-muted-foreground text-sm">
                      {compressionLevel}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="9"
                    value={compressionLevel}
                    onChange={(e) =>
                      setCompressionLevel(Number(e.target.value))
                    }
                    className="w-full"
                  />
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Fast</span>
                    <span>Best</span>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleCreate}
              disabled={files.length === 0 || isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Archive...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Create Archive
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {(isCreating || uploadProgress > 0 || processingProgress > 0) && (
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
                <p className="font-medium">Archive Created!</p>
                <p className="text-muted-foreground text-sm">
                  Your archive has been created in {format.toUpperCase()} format
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
