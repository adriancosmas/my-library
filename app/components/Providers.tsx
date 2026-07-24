"use client"

import { SavedToolsProvider } from "@/lib/useSavedTools"
import { Toaster } from "sonner"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SavedToolsProvider>
      {children}
      <Toaster />
    </SavedToolsProvider>
  )
}
