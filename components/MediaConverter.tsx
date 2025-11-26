"use client";

import { useState, useCallback, useEffect } from "react";
import { useMediaStore } from "@/state/useMediaStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Download,
  Video,
  Music,
  Loader2,
  Volume2,
  Image,
  Scissors,
  Film,
  Subtitles,
  FileText,
} from "lucide-react";
import type { VideoFormat, AudioFormat } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

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
    generateThumbnail,
    trimVideo,
    extractFrame,
    handleSubtitles,
    transcribeVideo,
    reset,
  } = useMediaStore();

  const [mode, setMode] = useState<
    | "convert"
    | "extract"
    | "thumbnail"
    | "trim"
    | "frame"
    | "subtitles"
    | "transcribe"
  >("convert");
  const [targetFormat, setTargetFormat] = useState<string>("mp4");
  const [videoCodec, setVideoCodec] = useState<string>("libx264");
  const [audioCodec, setAudioCodec] = useState<string>("aac");
  const [videoBitrate, setVideoBitrate] = useState<string>("1000k");
  const [audioBitrate, setAudioBitrate] = useState<string>("192k");
  const [width, setWidth] = useState<number>(1280);
  const [height, setHeight] = useState<number>(720);
  // Thumbnail options
  const [thumbnailTime, setThumbnailTime] = useState<string>("0");
  const [thumbnailFormat, setThumbnailFormat] = useState<"png" | "jpeg">("png");
  // Trim options
  const [startTime, setStartTime] = useState<string>("0");
  const [endTime, setEndTime] = useState<string>("60");
  const [trimTargetFormat, setTrimTargetFormat] = useState<string>("mp4");
  // Frame extraction options
  const [frameTime, setFrameTime] = useState<string>("0");
  const [frameNumber, setFrameNumber] = useState<string>("");
  const [frameFormat, setFrameFormat] = useState<"png" | "jpeg">("png");
  // Subtitle options
  const [subtitleOperation, setSubtitleOperation] = useState<
    "extract" | "embed"
  >("extract");
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitleText, setSubtitleText] = useState<string>("");
  const [subtitleFormat, setSubtitleFormat] = useState<"srt" | "vtt" | "ass">(
    "srt",
  );
  // Transcription options
  const [transcriptionLanguage, setTranscriptionLanguage] =
    useState<string>("");
  const [transcriptionFormat, setTranscriptionFormat] = useState<
    "txt" | "srt" | "vtt" | "json"
  >("txt");
  const [transcriptionText, setTranscriptionText] = useState<string>("");

  // Fetch transcription text when result is available
  useEffect(() => {
    if (resultUrl && mode === "transcribe") {
      fetch(resultUrl)
        .then((response) => response.text())
        .then((text) => {
          if (transcriptionFormat === "json") {
            try {
              const parsed = JSON.parse(text);
              setTranscriptionText(JSON.stringify(parsed, null, 2));
            } catch {
              setTranscriptionText(text);
            }
          } else {
            setTranscriptionText(text);
          }
        })
        .catch(() => {
          setTranscriptionText("Failed to load transcription");
        });
    } else {
      setTranscriptionText("");
    }
  }, [resultUrl, mode, transcriptionFormat]);

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
      const errorMessage = extractErrorMessage(err, "Failed to convert media");
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
      const errorMessage = extractErrorMessage(err, "Failed to extract audio");
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl && file) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const originalName = file.name.split(".")[0];
      let extension = targetFormat;
      if (mode === "thumbnail" || mode === "frame") {
        extension = thumbnailFormat || frameFormat;
      } else if (mode === "subtitles") {
        extension = subtitleFormat;
      } else if (mode === "trim") {
        extension = trimTargetFormat || "mp4";
      } else if (mode === "transcribe") {
        extension = transcriptionFormat;
      }
      link.download = `${originalName}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleThumbnail = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    try {
      await generateThumbnail({
        time: thumbnailTime ? parseFloat(thumbnailTime) : undefined,
        format: thumbnailFormat,
      });
      toast.success("Thumbnail generated successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to generate thumbnail",
      );
      toast.error(errorMessage);
    }
  };

  const handleTrim = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    if (!startTime || !endTime) {
      toast.error("Please specify start and end times");
      return;
    }

    try {
      await trimVideo({
        startTime: parseFloat(startTime),
        endTime: parseFloat(endTime),
        targetFormat: trimTargetFormat || undefined,
      });
      toast.success("Video trimmed successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to trim video");
      toast.error(errorMessage);
    }
  };

  const handleExtractFrame = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    if (!frameTime && !frameNumber) {
      toast.error("Please specify time or frame number");
      return;
    }

    try {
      await extractFrame({
        time: frameTime ? parseFloat(frameTime) : undefined,
        frameNumber: frameNumber ? parseInt(frameNumber) : undefined,
        format: frameFormat,
      });
      toast.success("Frame extracted successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to extract frame");
      toast.error(errorMessage);
    }
  };

  const handleSubtitleOperation = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    if (subtitleOperation === "embed" && !subtitleFile && !subtitleText) {
      toast.error("Please provide subtitle file or text");
      return;
    }

    try {
      await handleSubtitles({
        operation: subtitleOperation,
        subtitleFile: subtitleFile || undefined,
        subtitleText: subtitleText || undefined,
        format: subtitleFormat,
      });
      toast.success(
        `Subtitles ${subtitleOperation === "extract" ? "extracted" : "embedded"} successfully!`,
      );
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        `Failed to ${subtitleOperation} subtitles`,
      );
      toast.error(errorMessage);
    }
  };

  const handleTranscribe = async () => {
    if (!file) {
      toast.error("Please select a video file first");
      return;
    }

    try {
      await transcribeVideo({
        language: transcriptionLanguage || undefined,
        outputFormat: transcriptionFormat,
      });
      toast.success("Video transcribed successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to transcribe video",
      );
      toast.error(errorMessage);
    }
  };

  const handleReset = () => {
    reset();
    setMode("convert");
    setTargetFormat("mp4");
    setThumbnailTime("0");
    setThumbnailFormat("png");
    setStartTime("0");
    setEndTime("60");
    setTrimTargetFormat("mp4");
    setFrameTime("0");
    setFrameNumber("");
    setFrameFormat("png");
    setSubtitleOperation("extract");
    setSubtitleFile(null);
    setSubtitleText("");
    setSubtitleFormat("srt");
    setTranscriptionLanguage("");
    setTranscriptionFormat("txt");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {mode === "convert" || mode === "trim" ? (
                <Video className="h-5 w-5" />
              ) : mode === "extract" ? (
                <Music className="h-5 w-5" />
              ) : mode === "thumbnail" || mode === "frame" ? (
                <Image className="h-5 w-5" />
              ) : mode === "transcribe" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <Subtitles className="h-5 w-5" />
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
              <label className="text-sm font-medium">Operation</label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                <Button
                  variant={mode === "convert" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("convert")}
                  className="flex-col gap-1 py-3"
                >
                  <Video className="h-4 w-4" />
                  <span className="text-xs">Convert</span>
                </Button>
                <Button
                  variant={mode === "extract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("extract")}
                  className="flex-col gap-1 py-3"
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="text-xs">Extract Audio</span>
                </Button>
                <Button
                  variant={mode === "thumbnail" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("thumbnail")}
                  className="flex-col gap-1 py-3"
                >
                  <Image className="h-4 w-4" />
                  <span className="text-xs">Thumbnail</span>
                </Button>
                <Button
                  variant={mode === "trim" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("trim")}
                  className="flex-col gap-1 py-3"
                >
                  <Scissors className="h-4 w-4" />
                  <span className="text-xs">Trim</span>
                </Button>
                <Button
                  variant={mode === "frame" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("frame")}
                  className="flex-col gap-1 py-3"
                >
                  <Film className="h-4 w-4" />
                  <span className="text-xs">Extract Frame</span>
                </Button>
                <Button
                  variant={mode === "subtitles" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("subtitles")}
                  className="flex-col gap-1 py-3"
                >
                  <Subtitles className="h-4 w-4" />
                  <span className="text-xs">Subtitles</span>
                </Button>
                <Button
                  variant={mode === "transcribe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("transcribe")}
                  className="flex-col gap-1 py-3"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Transcribe</span>
                </Button>
              </div>
            </div>

            <Separator />

            {mode !== "transcribe" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Format</label>
                <div className="flex flex-wrap gap-2">
                  {(mode === "convert" ? VIDEO_FORMATS : AUDIO_FORMATS).map(
                    (format) => (
                      <Badge
                        key={format}
                        variant={
                          targetFormat === format ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => setTargetFormat(format)}
                      >
                        {format.toUpperCase()}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}

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

            {/* Mode-specific options */}
            {mode === "thumbnail" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={thumbnailTime}
                        onChange={(e) => setThumbnailTime(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <div className="flex gap-2">
                        <Button
                          variant={
                            thumbnailFormat === "png" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setThumbnailFormat("png")}
                        >
                          PNG
                        </Button>
                        <Button
                          variant={
                            thumbnailFormat === "jpeg" ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setThumbnailFormat("jpeg")}
                        >
                          JPEG
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === "trim" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Start Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        End Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        placeholder="60"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Target Format (optional)
                    </label>
                    <input
                      type="text"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={trimTargetFormat}
                      onChange={(e) => setTrimTargetFormat(e.target.value)}
                      placeholder="mp4"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === "frame" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Time (seconds)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={frameTime}
                        onChange={(e) => setFrameTime(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Or Frame Number
                      </label>
                      <input
                        type="number"
                        className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={frameNumber}
                        onChange={(e) => setFrameNumber(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <div className="flex gap-2">
                      <Button
                        variant={frameFormat === "png" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFrameFormat("png")}
                      >
                        PNG
                      </Button>
                      <Button
                        variant={frameFormat === "jpeg" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFrameFormat("jpeg")}
                      >
                        JPEG
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === "subtitles" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Operation</label>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          subtitleOperation === "extract"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setSubtitleOperation("extract")}
                      >
                        Extract
                      </Button>
                      <Button
                        variant={
                          subtitleOperation === "embed" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setSubtitleOperation("embed")}
                      >
                        Embed
                      </Button>
                    </div>
                  </div>
                  {subtitleOperation === "embed" && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Subtitle File (optional)
                        </label>
                        <input
                          type="file"
                          accept=".srt,.vtt,.ass"
                          className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                          onChange={(e) =>
                            setSubtitleFile(e.target.files?.[0] || null)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Or Subtitle Text
                        </label>
                        <textarea
                          className="border-input bg-background min-h-[100px] w-full rounded-md border px-3 py-2 font-mono text-sm"
                          value={subtitleText}
                          onChange={(e) => setSubtitleText(e.target.value)}
                          placeholder="1&#10;00:00:00,000 --> 00:00:05,000&#10;Subtitle text here"
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <div className="flex gap-2">
                      {(["srt", "vtt", "ass"] as const).map((format) => (
                        <Button
                          key={format}
                          variant={
                            subtitleFormat === format ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSubtitleFormat(format)}
                          className="uppercase"
                        >
                          {format}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === "transcribe" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Language (optional, auto-detects if empty)
                    </label>
                    <input
                      type="text"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      value={transcriptionLanguage}
                      onChange={(e) => setTranscriptionLanguage(e.target.value)}
                      placeholder="en, fr, es, de, etc."
                    />
                    <p className="text-muted-foreground text-xs">
                      Leave empty for auto-detection. Use ISO 639-1 language
                      codes (e.g., en, fr, es).
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Output Format</label>
                    <div className="flex gap-2">
                      {(["txt", "srt", "vtt", "json"] as const).map(
                        (format) => (
                          <Button
                            key={format}
                            variant={
                              transcriptionFormat === format
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setTranscriptionFormat(format)}
                            className="uppercase"
                          >
                            {format}
                          </Button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={
                mode === "convert"
                  ? handleConvert
                  : mode === "extract"
                    ? handleExtractAudio
                    : mode === "thumbnail"
                      ? handleThumbnail
                      : mode === "trim"
                        ? handleTrim
                        : mode === "frame"
                          ? handleExtractFrame
                          : mode === "subtitles"
                            ? handleSubtitleOperation
                            : handleTranscribe
              }
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
              ) : mode === "extract" ? (
                "Extract Audio"
              ) : mode === "thumbnail" ? (
                "Generate Thumbnail"
              ) : mode === "trim" ? (
                "Trim Video"
              ) : mode === "frame" ? (
                "Extract Frame"
              ) : mode === "subtitles" ? (
                `${subtitleOperation === "extract" ? "Extract" : "Embed"} Subtitles`
              ) : (
                "Transcribe Video"
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

      {/* Preview Section for Images */}
      {resultUrl && (mode === "thumbnail" || mode === "frame") && (
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === "thumbnail" ? "Thumbnail Preview" : "Frame Preview"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <img
                src={resultUrl}
                alt={mode === "thumbnail" ? "Thumbnail" : "Extracted frame"}
                className="h-auto w-full rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Section for Video/Audio */}
      {resultUrl && (mode === "convert" || mode === "trim") && (
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={resultUrl}
              controls
              className="h-auto w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </CardContent>
        </Card>
      )}

      {resultUrl && mode === "extract" && (
        <Card>
          <CardHeader>
            <CardTitle>Audio Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <audio src={resultUrl} controls className="w-full">
              Your browser does not support the audio tag.
            </audio>
          </CardContent>
        </Card>
      )}

      {/* Transcription Preview */}
      {resultUrl && mode === "transcribe" && (
        <Card>
          <CardHeader>
            <CardTitle>Transcription Result</CardTitle>
          </CardHeader>
          <CardContent>
            {transcriptionFormat === "json" ? (
              <pre className="border-input bg-background max-h-[400px] overflow-auto rounded-md border p-4 font-mono text-sm">
                {transcriptionText || "Loading..."}
              </pre>
            ) : (
              <div className="border-input bg-background max-h-[400px] overflow-auto rounded-md border p-4">
                <p className="font-mono text-sm whitespace-pre-wrap">
                  {transcriptionText || "Loading..."}
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
                <p className="font-medium">Operation Complete!</p>
                <p className="text-muted-foreground text-sm">
                  {mode === "convert"
                    ? `Your media has been converted to ${targetFormat.toUpperCase()}`
                    : mode === "extract"
                      ? `Audio extracted to ${targetFormat.toUpperCase()}`
                      : mode === "thumbnail"
                        ? "Thumbnail generated successfully"
                        : mode === "trim"
                          ? "Video trimmed successfully"
                          : mode === "frame"
                            ? "Frame extracted successfully"
                            : mode === "subtitles"
                              ? `Subtitles ${subtitleOperation === "extract" ? "extracted" : "embedded"} successfully`
                              : "Video transcribed successfully"}
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
