"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function GitHubStarButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-background/80 hover:bg-background/90 shadow-lg backdrop-blur-sm"
      onClick={() => {
        window.open(
          "https://github.com/1devspace/files-converter",
          "_blank",
          "noopener,noreferrer",
        );
      }}
    >
      <Github className="mr-2 h-4 w-4" />
      Star on GitHub
    </Button>
  );
}
