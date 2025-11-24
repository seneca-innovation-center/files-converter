"use client";

import { useState } from "react";
import { useQRStore } from "@/state/useQRStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Download, QrCode, Barcode, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import type { BarcodeFormat, QrErrorCorrectionLevel } from "@/lib/api/types";
import { extractErrorMessage } from "@/lib/utils";

const BARCODE_FORMATS: BarcodeFormat[] = [
  "CODE128",
  "EAN13",
  "EAN8",
  "UPC",
  "CODE39",
  "ITF14",
  "MSI",
  "pharmacode",
];

export function QRCodeConverter() {
  const { resultUrl, isGenerating, error, generateQR, generateBarcode, reset } =
    useQRStore();

  const [mode, setMode] = useState<"qr" | "barcode">("qr");
  const [data, setData] = useState<string>("");
  const [qrSize, setQrSize] = useState<number>(300);
  const [qrColor, setQrColor] = useState<string>("#000000");
  const [qrBgColor, setQrBgColor] = useState<string>("#FFFFFF");
  const [qrErrorLevel, setQrErrorLevel] = useState<QrErrorCorrectionLevel>("M");
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("CODE128");
  const [barcodeWidth, setBarcodeWidth] = useState<number>(200);
  const [barcodeHeight, setBarcodeHeight] = useState<number>(100);
  const [displayValue, setDisplayValue] = useState<boolean>(true);

  const handleGenerateQR = async () => {
    if (!data.trim()) {
      toast.error("Please enter data to encode");
      return;
    }

    try {
      await generateQR({
        data,
        size: qrSize,
        color: qrColor,
        backgroundColor: qrBgColor,
        errorCorrectionLevel: qrErrorLevel,
      });
      toast.success("QR code generated successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to generate QR code",
      );
      toast.error(errorMessage);
    }
  };

  const handleGenerateBarcode = async () => {
    if (!data.trim()) {
      toast.error("Please enter data to encode");
      return;
    }

    try {
      await generateBarcode({
        data,
        format: barcodeFormat,
        width: barcodeWidth,
        height: barcodeHeight,
        displayValue,
      });
      toast.success("Barcode generated successfully!");
    } catch (err) {
      const errorMessage = extractErrorMessage(
        err,
        "Failed to generate barcode",
      );
      toast.error(errorMessage);
    }
  };

  const handleDownload = () => {
    if (resultUrl) {
      const link = document.createElement("a");
      link.href = resultUrl;
      link.download = `${mode === "qr" ? "qr-code" : "barcode"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleReset = () => {
    reset();
    setMode("qr");
    setData("");
    setQrSize(300);
    setQrColor("#000000");
    setQrBgColor("#FFFFFF");
    setQrErrorLevel("M");
    setBarcodeFormat("CODE128");
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Options Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generator Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <div className="flex gap-2">
                <Button
                  variant={mode === "qr" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("qr")}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  QR Code
                </Button>
                <Button
                  variant={mode === "barcode" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setMode("barcode")}
                >
                  <Barcode className="mr-2 h-4 w-4" />
                  Barcode
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {mode === "qr" ? "Text or URL" : "Data"}
              </label>
              <textarea
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={data}
                onChange={(e) => setData(e.target.value)}
                placeholder={
                  mode === "qr"
                    ? "Enter text or URL..."
                    : "Enter data to encode..."
                }
              />
            </div>

            {mode === "qr" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size (pixels)</label>
                  <input
                    type="number"
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    min={100}
                    max={2000}
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Foreground Color
                    </label>
                    <input
                      type="color"
                      className="border-input h-10 w-full rounded-md border"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Background Color
                    </label>
                    <input
                      type="color"
                      className="border-input h-10 w-full rounded-md border"
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Error Correction
                  </label>
                  <select
                    className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                    value={qrErrorLevel}
                    onChange={(e) =>
                      setQrErrorLevel(e.target.value as QrErrorCorrectionLevel)
                    }
                  >
                    <option value="L">Low (L)</option>
                    <option value="M">Medium (M)</option>
                    <option value="Q">Quartile (Q)</option>
                    <option value="H">High (H)</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Format</label>
                  <div className="flex flex-wrap gap-2">
                    {BARCODE_FORMATS.map((format) => (
                      <Badge
                        key={format}
                        variant={
                          barcodeFormat === format ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => setBarcodeFormat(format)}
                      >
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width</label>
                    <input
                      type="number"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      min={100}
                      max={1000}
                      value={barcodeWidth}
                      onChange={(e) => setBarcodeWidth(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height</label>
                    <input
                      type="number"
                      className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
                      min={50}
                      max={500}
                      value={barcodeHeight}
                      onChange={(e) => setBarcodeHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="displayValue"
                    checked={displayValue}
                    onChange={(e) => setDisplayValue(e.target.checked)}
                  />
                  <label htmlFor="displayValue" className="text-sm font-medium">
                    Display value below barcode
                  </label>
                </div>
              </>
            )}

            <Button
              onClick={mode === "qr" ? handleGenerateQR : handleGenerateBarcode}
              disabled={!data.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {mode === "qr" ? "QR Code" : "Barcode"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {resultUrl ? (
              <div className="space-y-4">
                <div className="bg-muted flex items-center justify-center rounded-lg p-8">
                  <Image
                    src={resultUrl}
                    alt={mode === "qr" ? "QR Code" : "Barcode"}
                    width={mode === "qr" ? qrSize : barcodeWidth}
                    height={mode === "qr" ? qrSize : barcodeHeight}
                    className="rounded-lg"
                  />
                </div>
                <Badge variant="secondary" className="w-full justify-center">
                  {mode === "qr" ? "QR Code" : barcodeFormat} Generated
                </Badge>
              </div>
            ) : (
              <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
                <div className="text-center">
                  <QrCode className="text-muted-foreground mx-auto h-12 w-12" />
                  <p className="text-muted-foreground mt-2 text-sm">
                    {mode === "qr"
                      ? "Enter data and generate QR code"
                      : "Enter data and generate barcode"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
                <p className="font-medium">Generation Complete!</p>
                <p className="text-muted-foreground text-sm">
                  Your {mode === "qr" ? "QR code" : "barcode"} is ready
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
