"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialDark = saved ? saved === "dark" : prefersDark;
      setIsDark(initialDark);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    try { localStorage.setItem("theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      aria-label="Toggle theme"
      className="px-2 py-1 rounded border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
      title={isDark ? "Switch to light" : "Switch to dark"}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}

