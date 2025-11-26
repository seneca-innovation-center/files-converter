"use client";

import { useState, useCallback } from "react";
import { useExcelStore } from "@/state/useExcelStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dropzone } from "@/components/ui/dropzone";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/utils";
import { Upload, Loader2, Download, Image } from "lucide-react";

export function ExcelOperations() {
  const {
    file,
    setFile,
    exportChart,
    resultUrl,
    isProcessing,
    uploadProgress,
    processingProgress,
    reset,
  } = useExcelStore();

  const [sheetName, setSheetName] = useState<string>("");
  const [chartIndex, setChartIndex] = useState<string>("0");

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("Excel file loaded successfully");
      }
    },
    [setFile],
  );

  const handleExport = async () => {
    if (!file) {
      toast.error("Please select an Excel file first");
      return;
    }

    try {
      await exportChart({
        sheetName: sheetName || undefined,
        chartIndex: chartIndex ? parseInt(chartIndex) : undefined,
      });
      toast.success("Chart exported successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(err, "Failed to export chart");
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = "chart.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setSheetName("");
    setChartIndex("0");
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dropzone
            onDrop={handleDrop}
            accept={{
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "application/vnd.ms-excel": [".xls"],
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

      {/* Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Sheet Name (optional)</label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Sheet1"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Leave empty to use the first sheet
            </p>
          </div>
          <div>
            <label className="text-sm font-medium">Chart Index</label>
            <input
              type="number"
              min="0"
              value={chartIndex}
              onChange={(e) => setChartIndex(e.target.value)}
              className="border-input bg-background mt-1 w-full rounded-md border px-3 py-2 text-sm"
              placeholder="0"
            />
            <p className="text-muted-foreground mt-1 text-xs">
              Index of the chart to export (default: 0)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Export Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleExport}
            disabled={!file || isProcessing}
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
                <Image className="mr-2 h-4 w-4" />
                Export Chart
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Chart Exported!</p>
                  <p className="text-muted-foreground text-sm">
                    Your chart has been exported as PNG
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
              <div className="rounded-lg border">
                <img
                  src={resultUrl}
                  alt="Exported chart"
                  className="h-auto w-full rounded-lg"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
