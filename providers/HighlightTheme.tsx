"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function HighlightTheme() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const themeUrl =
    resolvedTheme === "dark"
      ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css"
      : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github.min.css";

  return <link rel="stylesheet" href={themeUrl} />;
}
