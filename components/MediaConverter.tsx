"use client";

import { useState, useCallback } from "react";
import { useMediaStore } from "@/state/useMediaStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, Video, Music, Loader2, Volume2 } from "lucide-react";
import type { VideoFormat, AudioFormat } from "@/lib/api/types";

const VIDEO_FORMATS: VideoFormat[] = [
  "mp4",
  "webm",
  "avi",
  "mov",
  "mkv",
  "gif",
];
const AUDIO_FORMATS: AudioFormat[] = [
  "mp3",
  "wav",
  "ogg",
  "flac",
  "aac",
  "m4a",
];

export function MediaConverter() {
  const {
    file,
    resultUrl,
    uploadProgress,
    processingProgress,
    isConverting,
    error,
    setFile,
    convertMedia,
    extractAudio,
    reset,
  } = useMediaStore();

  const [mode, setMode] = useState<"convert" | "extract">("convert");
  const [targetFormat, setTargetFormat] = useState<string>("mp4");
  const [videoCodec, setVideoCodec] = useState<string>("libx264");
  const [audioCodec, setAudioCodec] = useState<string>("aac");
  const [videoBitrate, setVideoBitrate] = useState<string>("1000k");
  const [audioBitrate, setAudioBitrate] = useState<string>("192k");
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Media file loaded successfully");
      }
    },
    [setFile],
  );

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a media file first");
      return;
    }

    try {
      await convertMedia({
        targetFormat,
        videoCodec: mode === "convert" ? videoCodec : undefined,
        audioCodec: mode === "convert" ? audioCodec : undefined,
        videoBitrate: mode === "convert" ? videoBitrate : undefined,
        audioBitrate: mode === "convert" ? audioBitrate : undefined,
        width: mode === "convert" ? width : undefined,
        height: mode === "convert" ? height : undefined,
      });
      toast.success("Media converted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to convert media";
      toast.error(errorMessage);
    }
  };

  const handleExtractAudio = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    try {
      await extractAudio({
        format: targetFormat as "mp3" | "wav" | "aac" | "flac",
      });
      toast.success("Audio extracted successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to extract audio";
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl && file) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const originalName = file.name.split(".")[0];
      link.download = `${originalName}.${targetFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setMode("convert");
    setTargetFormat("mp4");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "convert" ? (
                <Video className="h-5 w-5" />
              ) : (
                <Music className="h-5 w-5" />
              )}
              Upload Media File
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dropzone
              onDrop={handleDrop}
              accept={{
                "video/*": [".mp4", ".webm", ".avi", ".mov", ".mkv"],
                "audio/*": [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"],
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
                  <Video className="mr-2 h-4 w-4" />
                  Convert
                </Button>
                <Button
                  variant={mode === "extract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("extract")}
                >
                  <Volume2 className="mr-2 h-4 w-4" />
                  Extract Audio
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Format</label>
              <div className="flex flex-wrap gap-2">
                {(mode === "convert" ? VIDEO_FORMATS : AUDIO_FORMATS).map(
                  (format) => (
                    <Badge
                      key={format}
                      variant={targetFormat === format ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setTargetFormat(format)}
                    >
                      {format.toUpperCase()}
                    </Badge>
                  ),
                )}
              </div>
            </div>

            {mode === "convert" && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Codec</label>
                    <select
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={videoCodec}
                      onChange={(e) => setVideoCodec(e.target.value)}
                    >
                      <option value="libx264">H.264</option>
                      <option value="libx265">H.265</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio Codec</label>
                    <select
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={audioCodec}
                      onChange={(e) => setAudioCodec(e.target.value)}
                    >
                      <option value="aac">AAC</option>
                      <option value="libmp3lame">MP3</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Video Bitrate</label>
                    <input
                      type="text"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={videoBitrate}
                      onChange={(e) => setVideoBitrate(e.target.value)}
                      placeholder="1000k"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Audio Bitrate</label>
                    <input
                      type="text"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={audioBitrate}
                      onChange={(e) => setAudioBitrate(e.target.value)}
                      placeholder="192k"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width</label>
                    <input
                      type="number"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height</label>
                    <input
                      type="number"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={mode === "convert" ? handleConvert : handleExtractAudio}
              disabled={!file || isConverting}
              className="w-full"
            >
              {isConverting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : mode === "convert" ? (
                "Convert Media"
              ) : (
                "Extract Audio"
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
                  Your media has been{" "}
                  {mode === "convert" ? "converted" : "extracted"} to{" "}
                  {targetFormat.toUpperCase()}
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
