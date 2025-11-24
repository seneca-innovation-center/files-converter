"use client";

import { useState, useCallback } from "react";
import { useImagesStore } from "@/state/useImagesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ImageFormat } from "@/lib/api/types";

const IMAGE_FORMATS: ImageFormat[] = [
  "png",
  "jpeg",
  "webp",
  "avif",
  "tiff",
  "bmp",
];

export function ImageConverter() {
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
    convertImage,
    reset,
  } = useImagesStore();

  const [format, setFormat] = useState<ImageFormat>("png");
  const [removeBg, setRemoveBg] = useState(false);
  const [quality, setQuality] = useState(90);
  const [sliderValue, setSliderValue] = useState(50);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Image loaded successfully");
      }
    },
    [setFile],
  );

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select an image first");
      return;
    }

    try {
      await convertImage({
        format,
        removeBackground: removeBg,
        quality: format === "jpeg" || format === "webp" ? quality : undefined,
      });
      toast.success("Image converted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to convert image");
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
    setFormat("png");
    setRemoveBg(false);
    setQuality(90);
    setSliderValue(50);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "image/*": [
                  ".png",
                  ".jpg",
                  ".jpeg",
                  ".webp",
                  ".avif",
                  ".tiff",
                  ".bmp",
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
                {IMAGE_FORMATS.map((f) => (
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
                  <Sparkles className="h-4 w-4" />
                  Remove Background
                </label>
                <Button
                  variant={removeBg ? "default" : "outline"}
                  size="sm"
                  onClick={() => setRemoveBg(!removeBg)}
                >
                  {removeBg ? "Enabled" : "Disabled"}
                </Button>
              </div>

              {(format === "jpeg" || format === "webp") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quality</label>
                    <span className="text-muted-foreground text-sm">
                      {quality}%
                    </span>
                  </div>
                  <Slider
                    value={[quality]}
                    onValueChange={([value]) => setQuality(value)}
                    min={1}
                    max={100}
                    step={1}
                  />
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
                "Convert Image"
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
      {previewBefore && (
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Before/After Comparison Slider */}
            {previewAfter ? (
              <div className="space-y-4">
                <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0">
                      <Image
                        src={previewBefore}
                        alt="Before"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{
                        clipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
                      }}
                    >
                      <Image
                        src={previewAfter}
                        alt="After"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div
                      className="bg-primary absolute inset-y-0 z-10 w-1 cursor-ew-resize"
                      style={{ left: `${sliderValue}%` }}
                    >
                      <div className="bg-primary border-background absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 shadow-lg" />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(Number(e.target.value))}
                      className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0"
                    />
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center justify-between text-sm">
                  <span>Before</span>
                  <span>After (Converted)</span>
                </div>
              </div>
            ) : (
              <div className="bg-muted relative aspect-video w-full overflow-hidden rounded-lg">
                <Image
                  src={previewBefore}
                  alt="Original Image"
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Full Converted Image Preview */}
            {previewAfter && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Converted Image</h3>
                  <Badge variant="secondary">{format.toUpperCase()}</Badge>
                </div>
                <div className="bg-muted border-primary/20 relative aspect-video w-full overflow-hidden rounded-lg border-2">
                  <Image
                    src={previewAfter}
                    alt="Converted Image Preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-muted-foreground text-center text-xs">
                  This is your converted image. Click Download to save it.
                </p>
              </div>
            )}
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
                  Your image has been converted to {format.toUpperCase()}
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
