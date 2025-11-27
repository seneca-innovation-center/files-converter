"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/state/useAuthStore";
import { UserMenu } from "./UserMenu";
import { AuthDialog } from "./AuthDialog";
import { LogIn } from "lucide-react";

export function AuthHeader() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  if (isLoading) {
    return <div className="bg-muted h-10 w-20 animate-pulse rounded-md" />;
  }

  if (isAuthenticated) {
    return <UserMenu />;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAuthDialogOpen(true)}
      >
        <LogIn className="mr-2 h-4 w-4" />
        Sign In
      </Button>
      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab="signin"
      />
    </>
  );
}
