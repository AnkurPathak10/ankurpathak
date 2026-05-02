"use client";

import { AlignJustify } from "lucide-react";

import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { siteConfig } from "@/lib/site-config";

export function HeroNavbar() {
  return (
    <header className="pointer-events-auto fixed top-2 right-0 left-0 z-50 flex justify-center px-3 sm:top-2.5 sm:px-4 md:px-5">
      <nav
        className="flex w-full items-center justify-between gap-2.5 overflow-visible rounded-xl border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2.5 md:px-5"
        aria-label="Primary"
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2 sm:gap-3 md:gap-3.5">
          <span
            className="flex size-7 shrink-0 items-center justify-center bg-foreground text-[8px] font-bold tracking-tight text-background sm:size-8 sm:text-[9px]"
            aria-hidden
          >
            {siteConfig.initials}
          </span>
          <p className="min-w-0 py-0.5 font-sans text-[9px] font-medium uppercase leading-normal tracking-wide text-foreground/90 sm:text-[10px] sm:tracking-normal md:text-[11px] lg:text-xs">
            {siteConfig.navTagline}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <AnimatedThemeToggler
            type="button"
            variant="circle"
            className="flex size-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:size-9 [&_svg]:size-[19px] sm:[&_svg]:size-[22px]"
          />
          <button
            type="button"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:size-9"
            aria-label="Open menu"
            aria-expanded="false"
            aria-haspopup="dialog"
          >
            <AlignJustify className="size-[18px] sm:size-[20px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </nav>
    </header>
  );
}
