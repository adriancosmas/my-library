"use client"

import { SavedToolsProvider } from "@/lib/useSavedTools"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SavedToolsProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </SavedToolsProvider>
  )
}
