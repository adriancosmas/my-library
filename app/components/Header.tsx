import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 dark:bg-black/20 backdrop-blur-lg bg-white/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-semibold dark:text-white text-neutral-900 tracking-tighter font-sans">mY Directory.</a>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href="/submit"
            className="rounded-md border border-white/10 px-8 py-2 text-sm text-neutral-900 font-semibold bg-yellow-400 dark:bg-yellow-200 font-sans"
          >
            Submit
          </a>
        </div>
      </div>
    </header>
  );
}