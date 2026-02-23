import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/providers/AppProviders";
import React from "react";

export const metadata: Metadata = {
  title: {
    default:
      "ConvertHub - Universal File Converter | Images, 3D Models, Media & More",
    template: "%s | ConvertHub",
  },
  description:
    "ConvertHub is a powerful, free file conversion platform. Convert images (PNG, JPEG, WebP, SVG) with AI background removal, 3D models (GLB, OBJ, fbx, stl, ply), videos, audio, documents (PDF, DOCX, XLSX), archives, and more. Fast, secure, and 100% free.",
  keywords: [
    "file converter",
    "image converter",
    "3d model converter",
    "video converter",
    "audio converter",
    "document converter",
    "pdf converter",
    "glb converter",
    "obj converter",
    "fbx converter",
    "stl converter",
    "ply converter",
    "background removal",
    "ai background removal",
    "video transcription",
    "whisper transcription",
    "media converter",
    "format converter",
    "free file converter",
    "online converter",
    "batch converter",
    "convert images",
    "convert 3d models",
    "convert videos",
    "convert documents",
    "convert pdf",
    "convert word",
    "convert excel",
    "convert powerpoint",
    "archive converter",
    "zip converter",
    "code formatter",
    "ocr",
    "text extraction",
    "qr code generator",
    "barcode generator",
  ],
  authors: [{ name: "Mohamed Boukari" }],
  creator: "Mohamed Boukari",
  publisher: "ConvertHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://files-converter.vercel.app",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title:
      "ConvertHub - Universal File Converter | Images, 3D Models, Media & More",
    description:
      "Free, fast, and secure file conversion. Convert images with AI background removal, 3D models, videos, documents, and more. 100% free, no registration required.",
    siteName: "ConvertHub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ConvertHub - Universal File Converter",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ConvertHub - Universal File Converter",
    description:
      "Free, fast, and secure file conversion. Convert images, 3D models, videos, documents, and more.",
    images: ["/og-image.png"],
    creator: "@1devspace",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },
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
