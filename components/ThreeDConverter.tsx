"use client";

import { useState, useCallback, Suspense } from "react";
import dynamic from "next/dynamic";
import { use3DStore } from "@/state/use3DStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Box, Zap, Loader2, Package } from "lucide-react";
import type { ThreeDFormat } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  ),
});

const THREE_D_FORMATS: ThreeDFormat[] = ["glb", "obj", "usdz"];

export function ThreeDConverter() {
  const {
    file,
    previewBefore,
    previewAfter,
    resultUrl,
    uploadProgress,
    processingProgress,
    isConverting,
    error,
    setFile,
    convert3D,
    reset,
  } = use3DStore();

  const [format, setFormat] = useState<ThreeDFormat>("glb");
  const [optimize, setOptimize] = useState(false);
  const [compress, setCompress] = useState(false);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("3D model loaded successfully");
      }
    },
    [setFile],
  );

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a 3D model first");
      return;
    }

    try {
      await convert3D({
        format,
        optimize,
        compress,
      });
      toast.success("3D model converted successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to convert 3D model",
      );
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `converted.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setFormat("glb");
    setOptimize(false);
    setCompress(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Upload 3D Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "model/*": [".glb", ".gltf", ".obj", ".usdz"],
                "application/octet-stream": [".glb", ".gltf", ".obj"],
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
              <label className="text-sm font-medium">Output Format</label>
              <div className="flex flex-wrap gap-2">
                {THREE_D_FORMATS.map((f) => (
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

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4" />
                  Optimize Model
                </label>
                <Button
                  variant={optimize ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOptimize(!optimize)}
                >
                  {optimize ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {format === "glb" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Package className="h-4 w-4" />
                    Draco Compression
                  </label>
                  <Button
                    variant={compress ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompress(!compress)}
                  >
                    {compress ? "Enabled" : "Disabled"}
                  </Button>
                </div>
              )}
            </div>

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
                "Convert 3D Model"
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

      {/* Preview Section */}
      {(previewBefore || previewAfter) && (
        <Card>
          <CardHeader>
            <CardTitle>3D Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted relative aspect-square w-full overflow-hidden rounded-lg">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                  </div>
                }
              >
                <ModelViewer
                  src={previewAfter || previewBefore || ""}
                  alt="3D Model Preview"
                />
              </Suspense>
            </div>
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
                  Your 3D model has been converted to {format.toUpperCase()}
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
