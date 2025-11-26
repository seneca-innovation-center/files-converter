import { ImageConverter } from "@/components/ImageConverter";
import { ThreeDConverter } from "@/components/ThreeDConverter";
import { FilesConverter } from "@/components/FilesConverter";
import { MediaConverter } from "@/components/MediaConverter";
import { QRCodeConverter } from "@/components/QRCodeConverter";
import { ArchivesConverter } from "@/components/ArchivesConverter";
import { MarkdownConverter } from "@/components/MarkdownConverter";
import { OCRConverter } from "@/components/OCRConverter";
import { CodeFormatter } from "@/components/CodeFormatter";
import { PdfOperations } from "@/components/PdfOperations";
import { ExcelOperations } from "@/components/ExcelOperations";
import { PresentationsConverter } from "@/components/PresentationsConverter";
import { EbooksConverter } from "@/components/EbooksConverter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubStarButton } from "@/components/GitHubStarButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="bg-background min-h-screen">
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <ThemeToggle />
        <GitHubStarButton />
      </div>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Universal File Converter
          </h1>
          <p className="text-muted-foreground mt-4 text-lg md:text-xl">
            Convert images, 3D models, files, media, and more. Fast, reliable,
            and free.
          </p>
        </div>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="mb-8 flex w-full overflow-x-auto">
            <TabsTrigger value="images" className="shrink-0">
              Images
            </TabsTrigger>
            <TabsTrigger value="3d" className="shrink-0">
              3D Models
            </TabsTrigger>
            <TabsTrigger value="files" className="shrink-0">
              Files
            </TabsTrigger>
            <TabsTrigger value="pdf" className="shrink-0">
              PDF
            </TabsTrigger>
            <TabsTrigger value="excel" className="shrink-0">
              Excel
            </TabsTrigger>
            <TabsTrigger value="presentations" className="shrink-0">
              Presentations
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="shrink-0">
              Ebooks
            </TabsTrigger>
            <TabsTrigger value="media" className="shrink-0">
              Media
            </TabsTrigger>
            <TabsTrigger value="qr" className="shrink-0">
              QR/Barcode
            </TabsTrigger>
            <TabsTrigger value="archives" className="shrink-0">
              Archives
            </TabsTrigger>
            <TabsTrigger value="markdown" className="shrink-0">
              Markdown
            </TabsTrigger>
            <TabsTrigger value="ocr" className="shrink-0">
              OCR
            </TabsTrigger>
            <TabsTrigger value="code" className="shrink-0">
              Code
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="mt-6">
            <ImageConverter />
          </TabsContent>

          <TabsContent value="3d" className="mt-6">
            <ThreeDConverter />
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <FilesConverter />
          </TabsContent>

          <TabsContent value="pdf" className="mt-6">
            <PdfOperations />
          </TabsContent>

          <TabsContent value="excel" className="mt-6">
            <ExcelOperations />
          </TabsContent>

          <TabsContent value="presentations" className="mt-6">
            <PresentationsConverter />
          </TabsContent>

          <TabsContent value="ebooks" className="mt-6">
            <EbooksConverter />
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <MediaConverter />
          </TabsContent>

          <TabsContent value="qr" className="mt-6">
            <QRCodeConverter />
          </TabsContent>

          <TabsContent value="archives" className="mt-6">
            <ArchivesConverter />
          </TabsContent>

          <TabsContent value="markdown" className="mt-6">
            <MarkdownConverter />
          </TabsContent>

          <TabsContent value="ocr" className="mt-6">
            <OCRConverter />
          </TabsContent>

          <TabsContent value="code" className="mt-6">
            <CodeFormatter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
