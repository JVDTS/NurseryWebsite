import React from 'react';
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function LoginWithReplit() {
  return (
    <Button 
      variant="outline" 
      className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90"
      onClick={() => window.location.href = '/api/login'}
    >
      <ExternalLink className="h-4 w-4" />
      Log in with Replit
    </Button>
  );
}