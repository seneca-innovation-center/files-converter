"use client";

import { useState, useCallback } from "react";
import { useFilesStore } from "@/state/useFilesStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dropzone } from "@/components/ui/dropzone";
import { toast } from "sonner";
import {
  FileText,
  File,
  FileSpreadsheet,
  Video,
  Music,
  Archive,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";

const COMING_SOON_FORMATS = [
  { name: "PDF", icon: FileText, color: "bg-red-500" },
  { name: "Word", icon: FileText, color: "bg-blue-500" },
  { name: "Excel", icon: FileSpreadsheet, color: "bg-green-500" },
  { name: "PowerPoint", icon: File, color: "bg-orange-500" },
  { name: "Video", icon: Video, color: "bg-purple-500" },
  { name: "Audio", icon: Music, color: "bg-pink-500" },
  { name: "Archive", icon: Archive, color: "bg-yellow-500" },
  { name: "Text", icon: FileText, color: "bg-gray-500" },
];

export function FilesConverter() {
  const { file, setFile, convertFile, isConverting } = useFilesStore();
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        toast.success("File loaded successfully");
      }
    },
    [setFile],
  );

  const handleConvert = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    if (!selectedFormat) {
      toast.error("Please select a target format");
      return;
    }

    try {
      await convertFile({
        targetFormat: selectedFormat.toLowerCase(),
      });
      toast.info("Coming soon! This feature is under active development.", {
        duration: 5000,
      });
    } catch (err) {
      toast.error(err.message || "Failed to convert file");
    }
  };

  return (
    <div className="space-y-8">
      {/* Coming Soon Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-primary h-5 w-5" />
            <div>
              <p className="font-semibold">Coming Soon</p>
              <p className="text-muted-foreground text-sm">
                This feature is under active development. We&apos;re working
                hard to bring you the best file conversion experience!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Dropzone
            onDrop={handleDrop}
            maxSize={200 * 1024 * 1024}
            disabled={isConverting}
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

      {/* Supported Formats Grid */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">
          Future Supported Conversions
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {COMING_SOON_FORMATS.map((format) => {
            const Icon = format.icon;
            const isSelected =
              selectedFormat.toLowerCase() === format.name.toLowerCase();
            return (
              <Card
                key={format.name}
                className={`hover:border-primary cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/5" : ""
                }`}
                onClick={() => setSelectedFormat(format.name)}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`${format.color} rounded-lg p-3 text-white`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">{format.name}</p>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Convert Button */}
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleConvert}
            disabled={!file || !selectedFormat || isConverting}
            className="w-full"
            size="lg"
          >
            {isConverting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Convert File (Coming Soon)
              </>
            )}
          </Button>
          {file && selectedFormat && (
            <p className="text-muted-foreground mt-2 text-center text-sm">
              Converting {file.name} to {selectedFormat} format
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
