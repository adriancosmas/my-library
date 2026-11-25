import type { ComponentType } from "react"
import {
  Sparkle, Palette2, Widget5, Shapes, Cpu, Layout, Bulb, Gallery, Maximize, Users, Briefcase,
  Cloud, Share, Download, Presentation, Kanban, Note, Library, Folder, Window2, Package, Setting,
  Sliders, Play, Video, RecordCircle, Plug, MagicWand, Box, GraduationCap, Ghost, Code2, Music,
  Shield, Pen, Envelope, Text, Tag, type IconWeight,
} from "reicon-react"

type IconCmp = ComponentType<{ size?: number; weight?: IconWeight }>

// First match wins, so specific names go before general ones.
const RULES: [RegExp, IconCmp][] = [
  [/ui\/ux/, Layout],
  [/ui components?/, Widget5],
  [/icons?/, Shapes],
  [/upscal/, Maximize],
  [/stock photo|image|photo|avatar/, Gallery],
  [/inspiration/, Bulb],
  [/design/, Palette2],
  [/\bai\b/, Sparkle],
  [/bot/, Cpu],
  [/social/, Users],
  [/portfolio/, Briefcase],
  [/cloud|storage/, Cloud],
  [/transfer|share/, Share],
  [/download/, Download],
  [/whiteboard/, Presentation],
  [/project/, Kanban],
  [/notes?/, Note],
  [/library/, Library],
  [/collection|resource/, Folder],
  [/browser|website/, Window2],
  [/software/, Package],
  [/customi[sz]ation/, Sliders],
  [/tools?/, Setting],
  [/record/, RecordCircle],
  [/video/, Video],
  [/stream/, Play],
  [/api/, Plug],
  [/animation/, MagicWand],
  [/docker/, Box],
  [/education/, GraduationCap],
  [/mascot/, Ghost],
  [/open source/, Code2],
  [/music/, Music],
  [/security/, Shield],
  [/writing/, Pen],
  [/email|mail/, Envelope],
  [/font/, Text],
]

export function getCategoryIcon(label: string): IconCmp {
  const name = label.toLowerCase()
  return RULES.find(([re]) => re.test(name))?.[1] ?? Tag
}
