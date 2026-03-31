import { useState, useEffect } from "react";
import Home from "./pages/Home";

export type AppMode = "youtube" | "feeds";

export default function App() {
  const [mode, setMode] = useState<AppMode>("youtube");
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem("rogertube-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("rogertube-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <Home
      mode={mode}
      setMode={setMode}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
    />
  );
}
