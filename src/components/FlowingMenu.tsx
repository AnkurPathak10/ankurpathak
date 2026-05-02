"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

/** Uniform delay between row starts (open: top→bottom; close: bottom→top). */
export const FLOWING_MENU_ROW_STAGGER_SEC = 0.2;

const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;
const ROW_ENTER_DURATION = 0.55;
const ROW_EXIT_DURATION = 0.48;

export const FLOWING_MENU_ROW_EXIT_DURATION_SEC = ROW_EXIT_DURATION;

/** Total time until the last row finishes exiting (stagger + row tween). */
export function flowingMenuTotalExitDurationSec(itemCount: number): number {
  if (itemCount <= 0) return ROW_EXIT_DURATION;
  return (
    (itemCount - 1) * FLOWING_MENU_ROW_STAGGER_SEC + ROW_EXIT_DURATION
  );
}

function createRowVariants(itemCount: number): Variants {
  const last = Math.max(0, itemCount - 1);
  return {
    hidden: {
      x: "120%",
      opacity: 0,
    },
    show: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        x: {
          type: "tween",
          duration: ROW_ENTER_DURATION,
          ease: EASE_SMOOTH,
          delay: i * FLOWING_MENU_ROW_STAGGER_SEC,
        },
        opacity: {
          duration: 0.38,
          ease: "easeOut",
          delay: i * FLOWING_MENU_ROW_STAGGER_SEC,
        },
      },
    }),
    exit: (i: number) => ({
      x: "120%",
      opacity: 0,
      transition: {
        x: {
          type: "tween",
          duration: ROW_EXIT_DURATION,
          ease: EASE_SMOOTH,
          delay: (last - i) * FLOWING_MENU_ROW_STAGGER_SEC,
        },
        opacity: {
          duration: 0.32,
          ease: "easeOut",
          delay: (last - i) * FLOWING_MENU_ROW_STAGGER_SEC,
        },
      },
    }),
  };
}

/** Wait for row `motion.div` exit animations before this nav node reports exit complete. */
const navVariants: Variants = {
  hidden: {},
  show: {},
  exit: {
    transition: {
      when: "afterChildren",
    },
  },
};

interface MenuItemData {
  link: string;
  text: string;
  image: string;
}

interface FlowingMenuProps {
  items?: MenuItemData[];
  speed?: number;
  textColor?: string;
  bgColor?: string;
  marqueeBgColor?: string;
  marqueeTextColor?: string;
  borderColor?: string;
  className?: string;
  /** Called after a menu link is activated (e.g. close the overlay). */
  onNavigate?: () => void;
}

interface RowInnerProps extends MenuItemData {
  speed: number;
  textColor: string;
  marqueeBgColor: string;
  marqueeTextColor: string;
  borderColor: string;
  isFirst: boolean;
  onNavigate?: () => void;
  /** Mutable list of row roots; same index as this row’s `motion.div`. */
  rowRootsRef: React.MutableRefObject<(HTMLDivElement | null)[]>;
  rowIndex: number;
}

const FlowingMenu: React.FC<FlowingMenuProps> = ({
  items = [],
  speed = 15,
  textColor = "#fff",
  bgColor = "#120F17",
  marqueeBgColor = "#fff",
  marqueeTextColor = "#120F17",
  borderColor = "#fff",
  className,
  onNavigate,
}) => {
  const rowVariants = useMemo(() => createRowVariants(items.length), [items.length]);
  const rowRootsRef = useRef<(HTMLDivElement | null)[]>([]);
  rowRootsRef.current.length = items.length;

  return (
    <div className={cn("h-full w-full overflow-hidden bg-transparent", className)}>
      <motion.nav
        className="m-0 flex h-full flex-col p-0"
        variants={navVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        {items.map((item, idx) => (
          <motion.div
            key={`${item.text}-${idx}`}
            ref={(el) => {
              rowRootsRef.current[idx] = el;
            }}
            className={cn(
              "relative flex-1 overflow-hidden text-center",
              idx === 0 && "rounded-t-xl",
              idx === items.length - 1 && "rounded-b-xl",
            )}
            style={{
              backgroundColor: bgColor,
              borderTop: `1px solid ${borderColor}`,
            }}
            custom={idx}
            variants={rowVariants}
          >
            <FlowingMenuRowInner
              {...item}
              speed={speed}
              textColor={textColor}
              marqueeBgColor={marqueeBgColor}
              marqueeTextColor={marqueeTextColor}
              borderColor={borderColor}
              isFirst={idx === 0}
              onNavigate={onNavigate}
              rowRootsRef={rowRootsRef}
              rowIndex={idx}
            />
          </motion.div>
        ))}
      </motion.nav>
    </div>
  );
};

const FlowingMenuRowInner: React.FC<RowInnerProps> = ({
  link,
  text,
  image,
  speed,
  textColor,
  marqueeBgColor,
  marqueeTextColor,
  borderColor: _borderColor,
  isFirst: _isFirst,
  onNavigate,
  rowRootsRef,
  rowIndex,
}) => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: "expo" };

  const rowEl = () => rowRootsRef.current[rowIndex];

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number,
  ): "top" | "bottom" => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist =
      Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".marquee-part",
      ) as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener("resize", calculateRepetitions);
    return () => window.removeEventListener("resize", calculateRepetitions);
  }, [text, image]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector(
        ".marquee-part",
      ) as HTMLElement;
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      if (contentWidth === 0) return;

      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(marqueeInnerRef.current, {
        x: -contentWidth,
        duration: speed,
        ease: "none",
        repeat: -1,
      });
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [text, image, repetitions, speed]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    const el = rowEl();
    if (!el || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = el.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    const el = rowEl();
    if (!el || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = el.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height,
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(
        marqueeInnerRef.current,
        { y: edge === "top" ? "101%" : "-101%" },
        0,
      );
  };

  return (
    <>
      <a
        className="relative flex h-full cursor-pointer items-center justify-center font-sans text-[4vh] font-bold uppercase no-underline"
        href={link}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => onNavigate?.()}
        style={{ color: textColor }}
      >
        {text}
      </a>
      <div
        className="pointer-events-none absolute top-0 left-0 h-full w-full translate-y-[101%] overflow-hidden"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div className="flex h-full w-fit" ref={marqueeInnerRef}>
          {[...Array(repetitions)].map((_, idx) => (
            <div
              className="marquee-part flex shrink-0 items-center"
              key={idx}
              style={{ color: marqueeTextColor }}
            >
              <span className="px-[1vw] font-sans text-[4vh] leading-none font-bold whitespace-nowrap uppercase">
                {text}
              </span>
              <div
                className="mx-[2vw] my-[2em] h-[7vh] w-[200px] rounded-[50px] bg-cover bg-center py-[1em]"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FlowingMenu;
