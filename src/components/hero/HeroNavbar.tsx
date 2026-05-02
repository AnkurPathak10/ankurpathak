"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, X } from "lucide-react";

import FlowingMenu, {
  flowingMenuTotalExitDurationSec,
} from "@/components/FlowingMenu";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { useSiteAppearanceIsDark } from "@/hooks/use-site-appearance-is-dark";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const flowingNavItems = siteConfig.navMenuItems.map((item) => ({
  text: item.text,
  link: item.link,
  image: item.image,
}));

const MENU_ROW_EXIT_TOTAL_SEC =
  flowingMenuTotalExitDurationSec(flowingNavItems.length);

type CloseBtnRect = { top: number; left: number; width: number; height: number };

export function HeroNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [portalMounted, setPortalMounted] = useState(false);
  const [closeBtnRect, setCloseBtnRect] = useState<CloseBtnRect | null>(null);
  const siteIsDark = useSiteAppearanceIsDark();
  const menuTitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const openMenu = useCallback(() => {
    setPortalMounted(true);
    setMenuOpen(true);
  }, []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const onMenuExitComplete = useCallback(() => {
    setPortalMounted(false);
    setCloseBtnRect(null);
    requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  const syncCloseButtonPlacement = useCallback(() => {
    const el = menuButtonRef.current;
    if (!el || !menuOpen) return;
    const r = el.getBoundingClientRect();
    setCloseBtnRect({
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
    });
  }, [menuOpen]);

  useLayoutEffect(() => {
    if (!menuOpen) return;
    syncCloseButtonPlacement();
    window.addEventListener("resize", syncCloseButtonPlacement);
    window.addEventListener("scroll", syncCloseButtonPlacement, true);
    return () => {
      window.removeEventListener("resize", syncCloseButtonPlacement);
      window.removeEventListener("scroll", syncCloseButtonPlacement, true);
    };
  }, [menuOpen, syncCloseButtonPlacement]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;
    closeButtonRef.current?.focus();
  }, [menuOpen, closeBtnRect]);

  /** Inset panel aligned with navbar offset (top-2 / sm:top-2.5); light site → black panel; dark site → white panel. */
  const menuTheme = siteIsDark
    ? {
        bg: "#ffffff",
        text: "#000000",
        border: "#000000",
        marqueeBg: "#000000",
        marqueeText: "#ffffff",
        closeIcon: "#000000",
      }
    : {
        bg: "#000000",
        text: "#ffffff",
        border: "#ffffff",
        marqueeBg: "#ffffff",
        marqueeText: "#000000",
        closeIcon: "#ffffff",
      };

  const overlay =
    typeof document !== "undefined" &&
    portalMounted &&
    createPortal(
      <AnimatePresence mode="sync" onExitComplete={onMenuExitComplete}>
        {menuOpen ? (
          <motion.div
            key="menu-overlay"
            className="pointer-events-none fixed inset-0 z-[80]"
            variants={{
              visible: {},
              exit: {
                transition: { when: "afterChildren" as const },
              },
            }}
            initial="visible"
            animate="visible"
            exit="exit"
          >
            <motion.div
              key="menu-backdrop"
              className="pointer-events-auto fixed inset-0 z-[90] cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.22,
                  delay: Math.max(0, MENU_ROW_EXIT_TOTAL_SEC - 0.12),
                },
              }}
              aria-hidden
              onClick={closeMenu}
            />
            <motion.div
              key="menu-panel"
              id="site-flowing-nav"
              className={cn(
                "pointer-events-auto fixed z-[100] rounded-xl shadow-lg",
                "top-2 right-3 left-3 sm:top-2.5 sm:right-4 sm:left-4 md:right-5 md:left-5",
                "h-[600px] max-h-[min(600px,calc(100svh-1.5rem))]",
              )}
              role="dialog"
              aria-modal="true"
              aria-labelledby={menuTitleId}
              variants={{
                visible: {},
                exit: {
                  transition: { when: "afterChildren" as const },
                },
              }}
              initial="visible"
              animate="visible"
              exit="exit"
            >
              <h2 id={menuTitleId} className="sr-only">
                Site navigation
              </h2>
              <div className="relative h-full w-full overflow-hidden rounded-xl">
                <FlowingMenu
                  items={flowingNavItems}
                  speed={15}
                  bgColor={menuTheme.bg}
                  textColor={menuTheme.text}
                  borderColor={menuTheme.border}
                  marqueeBgColor={menuTheme.marqueeBg}
                  marqueeTextColor={menuTheme.marqueeText}
                  onNavigate={closeMenu}
                />
              </div>
            </motion.div>
            {closeBtnRect ? (
              <motion.button
                key="menu-close"
                type="button"
                ref={closeButtonRef}
                className={cn(
                  "pointer-events-auto fixed z-[110] flex cursor-pointer items-center justify-center rounded-full outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-offset-2",
                  siteIsDark
                    ? "focus-visible:ring-black focus-visible:ring-offset-white"
                    : "focus-visible:ring-white focus-visible:ring-offset-black",
                )}
                style={{
                  top: closeBtnRect.top,
                  left: closeBtnRect.left,
                  width: closeBtnRect.width,
                  height: closeBtnRect.height,
                  color: menuTheme.closeIcon,
                }}
                aria-label="Close menu"
                initial={{ opacity: 1, scale: 1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.92,
                  transition: {
                    duration: 0.2,
                    delay: Math.max(0, MENU_ROW_EXIT_TOTAL_SEC * 0.45),
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X className="size-[18px] sm:size-5" strokeWidth={2} aria-hidden />
              </motion.button>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );

  return (
    <>
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
              ref={menuButtonRef}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted sm:size-9"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-haspopup="dialog"
              aria-controls={menuOpen ? "site-flowing-nav" : undefined}
              onClick={openMenu}
            >
              <AlignJustify
                className="size-[18px] sm:size-[20px]"
                strokeWidth={2}
                aria-hidden
              />
            </button>
          </div>
        </nav>
      </header>
      {overlay}
    </>
  );
}
