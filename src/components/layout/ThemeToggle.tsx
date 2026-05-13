"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
      style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-amber-400" />
      ) : (
        <Moon size={16} className="text-indigo-500" />
      )}
    </button>
  );
}
