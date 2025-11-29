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
import { extractErrorMessage, getFileExtension } from "@/lib/utils";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  ),
});

const THREE_D_FORMATS: ThreeDFormat[] = [
  "glb",
  "gltf",
  "obj",
  "fbx",
  "stl",
  "ply",
];

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
    extract3DData,
    reset,
  } = use3DStore();

  const [format, setFormat] = useState<ThreeDFormat>("glb");
  const [optimize, setOptimize] = useState(false);
  const [compress, setCompress] = useState(false);
  const [extractType, setExtractType] = useState<
    "textures" | "animations" | "materials" | null
  >(null);
  const [extractedData, setExtractedData] = useState<string | null>(null);

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

  const handleExtract = async () => {
    if (!file) {
      toast.error("Please select a 3D model first");
      return;
    }

    if (!extractType) {
      toast.error("Please select an extraction type");
      return;
    }

    try {
      const data = await extract3DData({ extractType });
      setExtractedData(data);
      toast.success("3D data extracted successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to extract 3D data",
      );
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    reset();
    setFormat("glb");
    setOptimize(false);
    setCompress(false);
    setExtractType(null);
    setExtractedData(null);
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
                "model/*": [".glb", ".gltf", ".obj", ".fbx", ".stl", ".ply"],
                "application/octet-stream": [
                  ".glb",
                  ".gltf",
                  ".obj",
                  ".fbx",
                  ".stl",
                  ".ply",
                ],
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
                  format={
                    previewAfter
                      ? format
                      : file
                        ? getFileExtension(file.name)
                        : undefined
                  }
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extraction Section */}
      <Card>
        <CardHeader>
          <CardTitle>Extract 3D Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Extraction Type</label>
            <div className="flex flex-wrap gap-2">
              {(["textures", "animations", "materials"] as const).map(
                (type) => (
                  <Badge
                    key={type}
                    variant={extractType === type ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => setExtractType(type)}
                  >
                    {type}
                  </Badge>
                ),
              )}
            </div>
          </div>
          <Button
            onClick={handleExtract}
            disabled={!file || !extractType || isConverting}
            className="w-full"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Extract Data
              </>
            )}
          </Button>
          {extractedData && (
            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium">
                Extracted Data (JSON)
              </label>
              <pre className="bg-muted max-h-[400px] overflow-auto rounded-md p-4 text-xs">
                {extractedData}
              </pre>
              <Button
                onClick={() => {
                  const blob = new Blob([extractedData], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = `extracted-${extractType}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                  toast.success("Data downloaded");
                }}
                variant="outline"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
            </div>
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
