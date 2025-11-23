import { ImageConverter } from "@/components/ImageConverter";
import { ThreeDConverter } from "@/components/ThreeDConverter";
import { FilesConverter } from "@/components/FilesConverter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitHubStarButton } from "@/components/GitHubStarButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <GitHubStarButton />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Universal File Converter
          </h1>
          <p className="mt-4 text-lg text-muted-foreground md:text-xl">
            Convert images, 3D models, and files with ease. Fast, reliable, and
            free.
          </p>
        </div>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="3d">3D Models</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
}
