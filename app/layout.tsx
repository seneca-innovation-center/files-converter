import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import React from "react";

export const metadata: Metadata = {
  title: "Universal File Converter - Convert Images, 3D Models & Files",
  description:
    "Free, fast, and reliable file conversion. Convert images, 3D models (GLB, OBJ, USDZ), and various file formats with ease.",
  keywords: [
    "file converter",
    "image converter",
    "3d model converter",
    "glb converter",
    "obj converter",
    "usdz converter",
    "background removal",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
