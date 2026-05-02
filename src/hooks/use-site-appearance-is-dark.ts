"use client";

import { useCallback, useLayoutEffect, useState } from "react";

function resolveSiteAppearanceIsDark(): boolean {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  if (root.classList.contains("dark")) return true;
  if (root.classList.contains("light")) return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** True when the site is using the dark palette (`html.dark` or system dark with no `light`). */
export function useSiteAppearanceIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  const sync = useCallback(() => {
    setIsDark(resolveSiteAppearanceIsDark());
  }, []);

  useLayoutEffect(() => {
    sync();
    const root = document.documentElement;
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", sync);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", sync);
    };
  }, [sync]);

  return isDark;
}
