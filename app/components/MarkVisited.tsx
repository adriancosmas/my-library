"use client"

import { useEffect } from "react"
import { markVisited } from "@/lib/useVisited"

// Opening a detail page counts as visiting the tool or repo.
export default function MarkVisited({ id }: { id: string }) {
  useEffect(() => { markVisited(id) }, [id])
  return null
}
