"use client";

import { useState, useCallback } from "react";
import { usePresentationsStore } from "@/state/usePresentationsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  Presentation as FilePresentation,
  Upload,
  Loader2,
  Download,
  Plus,
  FileDown,
} from "lucide-react";
import type { SlideData } from "@/lib/api/types";

export function PresentationsConverter() {
  const {
    file,
    setFile,
    createPresentation,
    convertPresentation,
    resultUrl,
    isProcessing,
    uploadProgress,
    processingProgress,
    reset,
  } = usePresentationsStore();

  const [operation, setOperation] = useState<"create" | "convert" | null>(null);
  const [title, setTitle] = useState<string>("");
  const [slides, setSlides] = useState<SlideData[]>([
    { title: "", content: "" },
  ]);
  const [targetFormat, setTargetFormat] = useState<"pdf" | "png" | "jpeg">(
    "pdf",
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Presentation file loaded successfully");
      }
    },
    [setFile],
  );

  const addSlide = () => {
    setSlides([...slides, { title: "", content: "" }]);
  };

  const removeSlide = (index: number) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const updateSlide = (
    index: number,
    field: keyof SlideData,
    value: string,
  ) => {
    const newSlides = [...slides];
    if (field === "bullets") {
      newSlides[index] = {
        ...newSlides[index],
        bullets: value.split("\n").filter((b) => b.trim()),
      };
    } else {
      newSlides[index] = { ...newSlides[index], [field]: value };
    }
    setSlides(newSlides);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a presentation title");
      return;
    }

    if (slides.length === 0 || slides.every((s) => !s.title.trim())) {
      toast.error("Please add at least one slide with a title");
      return;
    }

    try {
      await createPresentation({
        title,
        slides: slides.filter((s) => s.title.trim()),
      });
      toast.success("Presentation created successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to create presentation",
      );
      toast.error(errorMessage);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a presentation file first");
      return;
    }

    try {
      await convertPresentation({ targetFormat });
      toast.success("Presentation converted successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to convert presentation",
      );
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const extension =
        operation === "create"
          ? "pptx"
          : targetFormat === "pdf"
            ? "pdf"
            : targetFormat;
      link.download = `presentation.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setOperation(null);
    setTitle("");
    setSlides([{ title: "", content: "" }]);
    setTargetFormat("pdf");
  };

  return (
    <div className="space-y-8">
      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button
              variant={operation === "create" ? "default" : "outline"}
              onClick={() => {
                setOperation("create");
                reset();
              }}
              className="h-auto flex-col gap-2 py-6"
            >
              <Plus className="h-6 w-6" />
              <span>Create PPTX</span>
            </Button>
            <Button
              variant={operation === "convert" ? "default" : "outline"}
              onClick={() => {
                setOperation("convert");
                reset();
              }}
              className="h-auto flex-col gap-2 py-6"
            >
              <FileDown className="h-6 w-6" />
              <span>Convert PPTX</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {operation === "create" && (
        <>
          {/* Create Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Presentation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="My Presentation"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Slides</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSlide}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Slide
                  </Button>
                </div>

                {slides.map((slide, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Slide {index + 1}</h4>
                          {slides.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSlide(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Slide Title *
                          </label>
                          <input
                            type="text"
                            value={slide.title}
                            onChange={(e) =>
                              updateSlide(index, "title", e.target.value)
                            }
                            className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Slide Title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Content</label>
                          <textarea
                            value={slide.content || ""}
                            onChange={(e) =>
                              updateSlide(index, "content", e.target.value)
                            }
                            className="border-input bg-background mt-1 min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Slide content..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Bullet Points (one per line)
                          </label>
                          <textarea
                            value={slide.bullets?.join("\n") || ""}
                            onChange={(e) =>
                              updateSlide(index, "bullets", e.target.value)
                            }
                            className="border-input bg-background mt-1 min-h-[80px] w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Point 1&#10;Point 2&#10;Point 3"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleCreate}
                disabled={isProcessing || !title.trim()}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FilePresentation className="mr-2 h-4 w-4" />
                    Create Presentation
                  </>
                )}
              </Button>
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {operation === "convert" && (
        <>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Presentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{
                  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                    [".pptx"],
                }}
                maxSize={200 * 1024 * 1024}
                disabled={isProcessing}
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

          {/* Format Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Target Format</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["pdf", "png", "jpeg"] as const).map((format) => (
                  <Button
                    key={format}
                    variant={targetFormat === format ? "default" : "outline"}
                    onClick={() => setTargetFormat(format)}
                    className="uppercase"
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Convert Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleConvert}
                disabled={!file || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileDown className="mr-2 h-4 w-4" />
                    Convert Presentation
                  </>
                )}
              </Button>
              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <Progress value={processingProgress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Result Section */}
      {resultUrl && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Operation Complete!</p>
                <p className="text-muted-foreground text-sm">
                  Your presentation has been processed
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
