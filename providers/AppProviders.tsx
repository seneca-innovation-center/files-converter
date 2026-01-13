"use client";
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "./ThemeProvider";
import { useAuthStore } from "@/state/useAuthStore";
import { HighlightTheme } from "./HighlightTheme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth on mount
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <HighlightTheme />

      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </ThemeProvider>
  );
}
