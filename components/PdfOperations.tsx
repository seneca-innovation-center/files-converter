"use client";

import { useState, useCallback } from "react";
import { usePdfStore } from "@/state/usePdfStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import {
  FileText,
  Upload,
  Loader2,
  Download,
  Merge,
  Scissors,
  FileEdit,
} from "lucide-react";

export function PdfOperations() {
  const {
    file,
    files,
    setFile,
    setFiles,
    mergePdfs,
    splitPdf,
    fillPdfForm,
    resultUrl,
    isProcessing,
    uploadProgress,
    processingProgress,
    reset,
  } = usePdfStore();

  const [operation, setOperation] = useState<
    "merge" | "split" | "fill-form" | null
  >(null);
  const [splitFrom, setSplitFrom] = useState<string>("");
  const [splitTo, setSplitTo] = useState<string>("");
  const [splitAt, setSplitAt] = useState<string>("");
  const [formDataJson, setFormDataJson] = useState<string>("");

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (operation === "merge") {
        setFiles(acceptedFiles);
        toast.success(`${acceptedFiles.length} PDF files loaded`);
      } else {
        const file = acceptedFiles[0];
        if (file) {
          setFile(file);
          toast.success("PDF file loaded successfully");
        }
      }
    },
    [operation, setFile, setFiles],
  );

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files");
      return;
    }

    try {
      await mergePdfs({ files });
      toast.success("PDFs merged successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to merge PDFs");
      toast.error(errorMessage);
    }
  };

  const handleSplit = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    if (!splitFrom && !splitTo && !splitAt) {
      toast.error("Please specify split options");
      return;
    }

    try {
      await splitPdf({
        splitFrom: splitFrom ? parseInt(splitFrom) : undefined,
        splitTo: splitTo ? parseInt(splitTo) : undefined,
        splitAt: splitAt || undefined,
      });
      toast.success("PDF split successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to split PDF");
      toast.error(errorMessage);
    }
  };

  const handleFillForm = async () => {
    if (!file) {
      toast.error("Please select a PDF file first");
      return;
    }

    if (!formDataJson) {
      toast.error("Please provide form data as JSON");
      return;
    }

    try {
      JSON.parse(formDataJson); // Validate JSON
      await fillPdfForm({ formData: formDataJson });
      toast.success("PDF form filled successfully!");
    } catch (err) {
      if (err instanceof SyntaxError) {
        toast.error("Invalid JSON format");
      } else {
        const errorMessage = extractErrorMessage(
          err,
          "Failed to fill PDF form",
        );
        toast.error(errorMessage);
      }
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `result.${operation === "merge" || operation === "split" || operation === "fill-form" ? "pdf" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setOperation(null);
    setSplitFrom("");
    setSplitTo("");
    setSplitAt("");
    setFormDataJson("");
  };

  return (
    <div className="space-y-8">
      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Operation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Button
              variant={operation === "merge" ? "default" : "outline"}
              onClick={() => {
                setOperation("merge");
                reset();
              }}
              className="h-auto flex-col gap-2 py-6"
            >
              <Merge className="h-6 w-6" />
              <span>Merge PDFs</span>
            </Button>
            <Button
              variant={operation === "split" ? "default" : "outline"}
              onClick={() => {
                setOperation("split");
                reset();
              }}
              className="h-auto flex-col gap-2 py-6"
            >
              <Scissors className="h-6 w-6" />
              <span>Split PDF</span>
            </Button>
            <Button
              variant={operation === "fill-form" ? "default" : "outline"}
              onClick={() => {
                setOperation("fill-form");
                reset();
              }}
              className="h-auto flex-col gap-2 py-6"
            >
              <FileEdit className="h-6 w-6" />
              <span>Fill Form</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {operation && (
        <>
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {operation === "merge" ? "Upload PDF Files" : "Upload PDF File"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dropzone
                onDrop={handleDrop}
                accept={{
                  "application/pdf": [".pdf"],
                }}
                maxSize={200 * 1024 * 1024}
                disabled={isProcessing}
                multiple={operation === "merge"}
                className="min-h-[200px]"
              />
              {operation === "merge" && files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {files.length} PDF file(s) selected
                  </p>
                </div>
              )}
              {operation !== "merge" && file && (
                <div className="mt-4 space-y-2">
                  <p className="text-muted-foreground text-sm">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Operation-Specific Options */}
          {operation === "split" && (
            <Card>
              <CardHeader>
                <CardTitle>Split Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">From Page</label>
                    <input
                      type="number"
                      min="1"
                      value={splitFrom}
                      onChange={(e) => setSplitFrom(e.target.value)}
                      className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Page</label>
                    <input
                      type="number"
                      min="1"
                      value={splitTo}
                      onChange={(e) => setSplitTo(e.target.value)}
                      className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                      placeholder="10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Or Split At Pages (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={splitAt}
                    onChange={(e) => setSplitAt(e.target.value)}
                    className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="5,10,15"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {operation === "fill-form" && (
            <Card>
              <CardHeader>
                <CardTitle>Form Data (JSON)</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={formDataJson}
                  onChange={(e) => setFormDataJson(e.target.value)}
                  className="border-input bg-background mt-1 min-h-[150px] w-full rounded-md border px-3 py-2 font-mono text-sm"
                  placeholder='{"name": "John Doe", "email": "john@example.com"}'
                />
              </CardContent>
            </Card>
          )}

          {/* Process Button */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={
                  operation === "merge"
                    ? handleMerge
                    : operation === "split"
                      ? handleSplit
                      : handleFillForm
                }
                disabled={
                  isProcessing ||
                  (operation === "merge" && files.length < 2) ||
                  (operation !== "merge" && !file) ||
                  (operation === "fill-form" && !formDataJson)
                }
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {operation === "merge"
                      ? "Merge PDFs"
                      : operation === "split"
                        ? "Split PDF"
                        : "Fill Form"}
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

          {/* Result Section */}
          {resultUrl && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Operation Complete!</p>
                    <p className="text-muted-foreground text-sm">
                      Your PDF has been processed
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
        </>
      )}
    </div>
  );
}
