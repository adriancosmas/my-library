// Shared control styles. Every pill control (button, chip, select, search field) is h-10,
// the same height as the sidebar search and the default Button.
const pill = "h-10 rounded-full text-sm font-medium"

export const ui = {
  button: `inline-flex items-center gap-2 px-4 ${pill} bg-secondary text-foreground transition-all hover:bg-accent active:scale-95`,
  chip: `inline-flex items-center px-4 ${pill} transition-colors`,
  chipOn: "bg-primary text-primary-foreground",
  chipOff: "bg-secondary text-secondary-foreground hover:bg-accent",
  select: `cursor-pointer appearance-none pl-4 pr-9 ${pill} bg-secondary text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary`,
  // Action inside an EmptyState: same h-10 pill as the other controls, yellow with ink text.
  emptyAction: `inline-flex items-center justify-center whitespace-nowrap px-4 ${pill} bg-primary text-primary-foreground transition-all hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`,
  field: "flex h-10 items-center gap-2 rounded-full bg-secondary px-4 transition-shadow focus-within:ring-2 focus-within:ring-primary",
  fieldInput: "h-8 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden",
}
