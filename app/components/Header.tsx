import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 dark:bg-black/80 backdrop-blur bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-semibold dark:text-white text-neutral-900">mY Library</a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/submit"
            className="rounded-md border border-white/10 px-3 py-2 text-sm text-neutral-900 font-semibold bg-yellow-400 dark:bg-yellow-200"
          >
            Submit
          </a>
        </div>
      </div>
    </header>
  );
}