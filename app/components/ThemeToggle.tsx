"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialDark = stored ? stored === "dark" : prefersDark;
      setIsDark(initialDark);
      document.documentElement.classList.toggle("dark", initialDark);
    } catch (e) {
      // noop
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (e) {
      // noop
    }
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={toggleTheme}
      className="gap-2 border dark:border-white/10 border-black/10 bg-white/5 dark:text-zinc-200 hover:bg-gray-100/50 dark:hover:bg-white/10 cursor-pointer"
      aria-label="Toggle color theme"
    >
      {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
      <span className="hidden sm:inline font-sans font-light">{isDark ? "Light" : "Dark"} mode</span>
    </Button>
  );
}