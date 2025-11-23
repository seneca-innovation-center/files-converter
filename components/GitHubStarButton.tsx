"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function GitHubStarButton() {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        className="shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background/90"
        onClick={() => {
          window.open(
            "https://github.com/mohamedboukari/files-converter",
            "_blank",
            "noopener,noreferrer"
          );
        }}
      >
        <Github className="h-4 w-4 mr-2" />
        Star on GitHub
      </Button>
    </div>
  );
}
