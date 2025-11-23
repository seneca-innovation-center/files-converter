"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "./card";

interface DropzoneProps {
  onDrop: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Dropzone({
  onDrop,
  accept,
  maxSize = 200 * 1024 * 1024, // 200MB default
  multiple = false,
  disabled = false,
  className,
  children,
}: DropzoneProps) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple,
      disabled,
    });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative cursor-pointer rounded-lg border-2 border-dashed transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input {...getInputProps()} />
      {children || (
        <Card className="border-0 bg-transparent shadow-none">
          <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="bg-muted rounded-full p-4">
              {isDragActive ? (
                <Upload className="text-primary h-8 w-8" />
              ) : (
                <File className="text-muted-foreground h-8 w-8" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive
                  ? "Drop your file here"
                  : "Drag & drop your file here"}
              </p>
              <p className="text-muted-foreground text-sm">
                or click to browse
              </p>
            </div>
            {fileRejections.length > 0 && (
              <p className="text-destructive text-sm">
                {fileRejections[0].errors[0].message}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
