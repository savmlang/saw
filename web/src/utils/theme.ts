import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

const getDefaultTheme = (): Theme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getSavedTheme = (): Theme => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" ? saved : getDefaultTheme();
};

let currentTheme: Theme = typeof window !== "undefined" ? getSavedTheme() : "light";

let counter = 0;
let cb: { [key: number]: () => void } = {};

export const applyTheme = () => {
  if (typeof document !== "undefined") {
    document.body.classList.toggle("dark", currentTheme === "dark");
  }
};

export const updateToggleTheme = () => {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem(STORAGE_KEY, currentTheme);
  applyTheme();
  Object.values(cb).forEach((c) => c());
};

export const getTheme = () => currentTheme;

export function useTheme(): Theme {
  const [theme, setTheme] = useState(getTheme());

  useEffect(() => {
    const keyctr = structuredClone(counter);
    cb[keyctr] = () => {
      setTheme(getTheme());
    };

    counter += 1;

    return () => {
      delete cb[keyctr];
    };
  }, []);

  return theme;
}

applyTheme();