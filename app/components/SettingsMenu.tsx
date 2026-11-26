"use client"

import { useRouter } from "next/navigation"
import { Check, RotateCcw, Settings } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { resetPrefs, useHtmlPref } from "@/lib/useHtmlPref"

type Option = { value: string; label: string }

const VISION: Option[] = [
  { value: "off", label: "Default" },
  { value: "rg", label: "Red-green safe" },
  { value: "by", label: "Blue-yellow safe" },
]
const TEXT = [
  { value: "sm", label: "Small text", size: "text-xs" },
  { value: "md", label: "Default text", size: "text-base" },
  { value: "lg", label: "Large text", size: "text-xl" },
]
const CARDS: Option[] = [
  { value: "full", label: "Full" },
  { value: "compact", label: "Compact" },
  { value: "minimal", label: "Minimal" },
]
const ACCENTS = [
  { value: "yellow", label: "Default", background: "oklch(0.84 0.16 95)" },
  { value: "bw", label: "Black and white", background: "linear-gradient(135deg, #111 50%, #fff 50%)" },
]

const heading = "px-3 pb-1.5 pt-5 text-xs font-medium uppercase tracking-wide text-muted-foreground"
const row = "flex h-10 w-full items-center justify-between gap-3 rounded-full px-3 text-sm font-medium text-foreground hover:bg-secondary"

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={row}>
      {label}
      <span className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/40"}`}>
        <span className={`size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
      </span>
    </button>
  )
}

function Choice({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <>
      <p className={heading}>{label}</p>
      <div role="radiogroup" aria-label={label} className="space-y-0.5">
        {options.map((o) => (
          <button key={o.value} role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)} className={row}>
            {o.label}
            {value === o.value && <Check className="size-4 text-primary" aria-hidden />}
          </button>
        ))}
      </div>
    </>
  )
}

function Segmented({ label, value, onChange, options }: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Option[]
}) {
  return (
    <>
      <p className={heading}>{label}</p>
      <div role="radiogroup" aria-label={label} className="flex h-10 items-center rounded-full bg-secondary p-1">
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`grid h-8 flex-1 place-items-center rounded-full text-xs font-semibold transition-colors ${
              value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </>
  )
}

export default function SettingsMenu({ fullWidth, iconOnly }: { fullWidth?: boolean; iconOnly?: boolean }) {
  const router = useRouter()
  const [vision, setVision] = useHtmlPref("vision", "off")
  const [accent, setAccent] = useHtmlPref("accent", "yellow")
  const [motion, setMotion] = useHtmlPref("motion", "full")
  const [font, setFont] = useHtmlPref("font", "sans")
  const [corners, setCorners] = useHtmlPref("corners", "round")
  const [text, setText] = useHtmlPref("text", "md")
  const [cards, setCards] = useHtmlPref("cards", "full")
  const [seen, setSeen] = useHtmlPref("seen", "off")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={iconOnly ? "icon-lg" : "lg"}
          aria-label="Settings"
          className={
            iconOnly
              ? "size-11 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
              : `justify-start gap-3 rounded-full px-4 text-muted-foreground hover:bg-secondary hover:text-foreground ${fullWidth ? "w-full" : ""}`
          }
        >
          <Settings className="size-5" />
          {!iconOnly && <span>Settings</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={iconOnly ? "right" : "top"}
        align="end"
        collisionPadding={12}
        className="thin-scrollbar max-h-[var(--radix-popover-content-available-height)] w-72 overflow-y-auto p-2"
      >
        <p className="px-3 pb-1.5 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Display</p>
        <Switch label="Reduce motion" checked={motion === "reduce"} onChange={(v) => setMotion(v ? "reduce" : "full")} />
        <Switch label="Serif font" checked={font === "serif"} onChange={(v) => setFont(v ? "serif" : "sans")} />
        <Switch label="Square corners" checked={corners === "square"} onChange={(v) => setCorners(v ? "square" : "round")} />

        <p className={heading}>Text size</p>
        <div role="radiogroup" aria-label="Text size" className="flex h-10 items-center rounded-full bg-secondary p-1">
          {TEXT.map((o) => (
            <button
              key={o.value}
              role="radio"
              aria-checked={text === o.value}
              aria-label={o.label}
              onClick={() => setText(o.value)}
              className={`grid h-8 flex-1 place-items-center rounded-full font-semibold leading-none transition-colors ${o.size} ${
                text === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              A
            </button>
          ))}
        </div>

        <p className={heading}>Accent color</p>
        <div role="radiogroup" aria-label="Accent color" className="flex gap-2 px-3 py-1">
          {ACCENTS.map((a) => (
            <button
              key={a.value}
              role="radio"
              aria-checked={accent === a.value}
              aria-label={a.label}
              title={a.label}
              onClick={() => setAccent(a.value)}
              style={{ background: a.background }}
              className="grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-popover transition-all aria-checked:ring-2 aria-checked:ring-foreground"
            >
              {accent === a.value && <Check className="size-4 text-black mix-blend-difference invert" strokeWidth={3} aria-hidden />}
            </button>
          ))}
        </div>

        <Choice label="Color vision" value={vision} onChange={setVision} options={VISION} />

        <Segmented label="Card details" value={cards} onChange={setCards} options={CARDS} />

        <p className={heading}>Behavior</p>
        <Switch label="Dim visited tools" checked={seen === "dim"} onChange={(v) => setSeen(v ? "dim" : "off")} />

        <div className="mt-3 border-t border-border pt-2">
          <button
            onClick={() => { resetPrefs(); router.refresh(); toast.success("Settings reset") }}
            className={`${row} justify-start text-muted-foreground`}
          >
            <RotateCcw className="size-4" /> Reset settings
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
