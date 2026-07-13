"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const nextTheme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    window.localStorage.setItem("edurate_theme", nextTheme);
  }

  return (
    <button
      aria-label="Rəng rejimini dəyiş"
      className="app-card flex size-11 shrink-0 items-center justify-center rounded-2xl text-gray-500 transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
      title="Rəng rejimini dəyiş"
      type="button"
      onClick={toggleTheme}
    >
      <Moon className="size-4 dark:hidden" />
      <Sun className="hidden size-4 dark:block" />
    </button>
  );
}
