"use client"

import { SavedToolsProvider } from "@/lib/useSavedTools"

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SavedToolsProvider>{children}</SavedToolsProvider>
}
