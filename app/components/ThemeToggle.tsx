"use client";
import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ fullWidth, iconOnly }: { fullWidth?: boolean; iconOnly?: boolean }) {
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
      size={iconOnly ? "icon-lg" : "lg"}
      onClick={toggleTheme}
      className={
        iconOnly
          ? "size-11 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          : `justify-start gap-3 rounded-full px-4 text-muted-foreground hover:bg-secondary hover:text-foreground ${fullWidth ? "w-full" : ""}`
      }
      aria-label="Toggle color theme"
    >
      {isDark ? <SunIcon className="size-5" /> : <MoonIcon className="size-5" />}
      {!iconOnly && <span>{isDark ? "Light" : "Dark"} mode</span>}
    </Button>
  );
}
