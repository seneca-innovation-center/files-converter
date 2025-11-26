"use client";

import { useState, useCallback } from "react";
import { useEbooksStore } from "@/state/useEbooksStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  BookOpen,
  Upload,
  Loader2,
  Download,
  Plus,
  FileDown,
} from "lucide-react";

export function EbooksConverter() {
  const {
    file,
    setFile,
    createEbook,
    convertEbook,
    resultUrl,
    isProcessing,
    uploadProgress,
    processingProgress,
    reset,
  } = useEbooksStore();

  const [operation, setOperation] = useState<"create" | "convert" | null>(null);
  const [title, setTitle] = useState<string>("");
  const [author, setAuthor] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [sourceFormat, setSourceFormat] = useState<"html" | "txt">("html");
  const [targetFormat, setTargetFormat] = useState<"pdf" | "html" | "txt">(
    "pdf",
  );

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Ebook file loaded successfully");
      }
    },
    [setFile],
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a book title");
      return;
    }

    if (!author.trim()) {
      toast.error("Please enter an author name");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter book content");
      return;
    }

    try {
      await createEbook({
        title,
        author,
        content,
        sourceFormat,
      });
      toast.success("Ebook created successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to create ebook");
      toast.error(errorMessage);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select an EPUB file first");
      return;
    }

    try {
      await convertEbook({ targetFormat });
      toast.success("Ebook converted successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to convert ebook");
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      const extension =
        operation === "create"
          ? "epub"
          : targetFormat === "pdf"
            ? "pdf"
            : targetFormat;
      link.download = `ebook.${extension}`;
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
    setAuthor("");
    setContent("");
    setSourceFormat("html");
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
              <span>Create EPUB</span>
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
              <span>Convert EPUB</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {operation === "create" && (
        <>
          {/* Create Form */}
          <Card>
            <CardHeader>
              <CardTitle>Create Ebook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="My Awesome Book"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Author *</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Author Name"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Source Format</label>
                <div className="mt-2 flex gap-2">
                  <Button
                    variant={sourceFormat === "html" ? "default" : "outline"}
                    onClick={() => setSourceFormat("html")}
                    size="sm"
                  >
                    HTML
                  </Button>
                  <Button
                    variant={sourceFormat === "txt" ? "default" : "outline"}
                    onClick={() => setSourceFormat("txt")}
                    size="sm"
                  >
                    TXT
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Content *</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="border-input bg-background mt-1 min-h-[300px] w-full rounded-md border px-3 py-2 font-mono text-sm"
                  placeholder={
                    sourceFormat === "html"
                      ? "<h1>Chapter 1</h1><p>Your content here...</p>"
                      : "Your plain text content here..."
                  }
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={
                  isProcessing ||
                  !title.trim() ||
                  !author.trim() ||
                  !content.trim()
                }
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
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create Ebook
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
                Upload EPUB File
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{
                  "application/epub+zip": [".epub"],
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
                {(["pdf", "html", "txt"] as const).map((format) => (
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
                    Convert Ebook
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
                  Your ebook has been processed
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
