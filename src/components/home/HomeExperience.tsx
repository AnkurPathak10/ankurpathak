"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

import Galaxy from "@/components/Galaxy";
import { Hero } from "@/components/hero/Hero";
import { HeroNavbar } from "@/components/hero/HeroNavbar";
import { useSiteAppearanceIsDark } from "@/hooks/use-site-appearance-is-dark";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Total document height of the pin region; the hero stays sticky for ~PIN_SCROLL_VH - 100vh of scroll. */
const PIN_SCROLL_VH = 220;

/** How many vh of scroll move the About sheet from fully-hidden to fully-covering. */
const COVER_DISTANCE_VH = 100;

/** Black About panel height as a fraction of the viewport (75–80% → ~78%). */
const ABOUT_PANEL_HEIGHT_VH = 83;

/** Tailwind `lg` breakpoint = 64rem. Used to swap mobile galaxy card for the section-level backdrop. */
function useIsLgUp(): boolean {
  const [isLg, setIsLg] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 64rem)");
    const update = () => setIsLg(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);
  return isLg;
}

/** Spring that follows scroll-driven target — keeps gliding after wheel stops (reference-style inertia). */
function useAboutSheetSpringY(
  scrollRootRef: React.RefObject<HTMLDivElement | null>,
  reduceMotion: boolean,
) {
  const targetY = useMotionValue(0);
  const springConfig = useMemo(
    () =>
      reduceMotion
        ? { stiffness: 8000, damping: 120, mass: 0.25 }
        : {
            stiffness: 120,
            damping: 30,
            mass: 0.95,
            restSpeed: 0.25,
            restDelta: 0.15,
          },
    [reduceMotion],
  );
  const smoothY = useSpring(targetY, springConfig);

  useLayoutEffect(() => {
    const el = scrollRootRef.current;
    if (!el) return;

    const compute = () => {
      const vh = window.innerHeight;
      const panelLift = vh * (ABOUT_PANEL_HEIGHT_VH / 100);
      const coverPx = Math.max(1, vh * (COVER_DISTANCE_VH / 100));
      const scrolled = Math.max(0, (window.scrollY || 0) - el.offsetTop);
      const cover = Math.min(1, scrolled / coverPx);
      let next: number;
      if (reduceMotion) {
        next = cover > 0.02 ? -panelLift : 0;
      } else {
        next = -cover * panelLift;
      }
      targetY.set(next);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, [scrollRootRef, reduceMotion, targetY]);

  return smoothY;
}

export function HomeExperience() {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const siteDark = useSiteAppearanceIsDark();
  const reduceMotion = useReducedMotion() ?? false;

  const aboutSpringY = useAboutSheetSpringY(scrollRootRef, reduceMotion);
  const isLgUp = useIsLgUp();

  const aboutSurface = siteDark
    ? "bg-[#f5f5f5] text-neutral-950"
    : "bg-black text-white";

  const projectsSurface = siteDark
    ? "bg-neutral-950 text-neutral-100"
    : "bg-white text-neutral-900";

  return (
    <>
      <HeroNavbar />

      <div
        ref={scrollRootRef}
        className="relative w-full"
        style={{ minHeight: `${PIN_SCROLL_VH}vh` }}
      >
        <div className="sticky top-0 h-svh w-full overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Hero />
          </div>

          {/*
            About sheet — anchored just below the sticky viewport (top:100%).
            translateY goes from 0 (hidden) to -(ABOUT_PANEL_HEIGHT_VH% of vh) so the panel
            stops with its bottom on the viewport bottom (~22% hero strip remains at top).
            After the pin releases, the sticky scrolls up and the section below follows.
          */}
          <motion.div
            className="absolute inset-x-0 top-full z-20 will-change-transform"
            style={{ y: aboutSpringY }}
          >
            <section
              className={cn(
                "relative isolate flex shrink-0 flex-col overflow-hidden rounded-t-[2rem] px-5 pt-8 pb-12 sm:rounded-t-[2.5rem] sm:px-8 sm:pt-10 sm:pb-16",
                aboutSurface,
              )}
              style={{ height: `${ABOUT_PANEL_HEIGHT_VH}svh` }}
              aria-labelledby="about-heading"
            >
              {/* lg+ Galaxy backdrop — section-level so it spans true panel edges (top, bottom, left)
                   and bleeds slightly past the column boundary on the right via right: 58%. */}
              {isLgUp ? (
                <div
                  aria-hidden
                  className="pointer-events-auto absolute inset-0 z-0"
                  style={{ right: "58%" }}
                >
                  <Galaxy
                    mouseRepulsion
                    mouseInteraction
                    density={1}
                    glowIntensity={0.3}
                    saturation={0}
                    hueShift={140}
                    twinkleIntensity={0.3}
                    rotationSpeed={0.1}
                    repulsionStrength={2}
                    autoCenterRepulsion={0}
                    starSpeed={0.5}
                    speed={1}
                    transparent
                  />
                </div>
              ) : null}

              <div
                className={cn(
                  "relative z-10 mx-auto grid w-full max-w-352 grid-cols-1 items-stretch gap-10",
                  "lg:h-full lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-x-10 lg:gap-y-0 xl:gap-x-14",
                )}
              >
                <div
                  className={cn(
                    "relative isolate flex w-full flex-col justify-center overflow-hidden",
                    "max-lg:min-h-[min(50vh,28rem)] sm:max-lg:min-h-[min(45vh,32rem)]",
                    "max-lg:rounded-2xl",
                    /* lg+ heading column is just a layout slot for the heading; Galaxy lives at section level */
                  )}
                >
                  {/* Mobile-only Galaxy card behind heading (lg+ uses section-level Galaxy above) */}
                  {!isLgUp ? (
                    <div className="pointer-events-auto absolute inset-0 z-0">
                      <Galaxy
                        mouseRepulsion
                        mouseInteraction
                        density={1}
                        glowIntensity={0.3}
                        saturation={0}
                        hueShift={140}
                        twinkleIntensity={0.3}
                        rotationSpeed={0.1}
                        repulsionStrength={2}
                        autoCenterRepulsion={0}
                        starSpeed={0.5}
                        speed={1}
                        transparent
                      />
                    </div>
                  ) : null}
                  <h2
                    id="about-heading"
                    className={cn(
                      "relative z-10 pr-1 pl-5 font-sans font-black leading-[0.88] tracking-[-0.02em] pointer-events-none sm:pl-8",
                      siteDark
                        ? "drop-shadow-[0_1px_10px_rgba(0,0,0,0.18)]"
                        : "drop-shadow-[0_2px_28px_rgba(0,0,0,0.88)]",
                    )}
                    style={{
                      fontSize: "clamp(3.75rem, 11vw, 9.5rem)",
                    }}
                  >
                    <span className="block">{siteConfig.aboutHeadingLine1}</span>
                    <span className="block">{siteConfig.aboutHeadingLine2}</span>
                  </h2>
                </div>
                <div className="relative z-10 flex w-full flex-col justify-center gap-8 lg:gap-10 lg:py-4">
                  <p
                    className="w-full max-w-none font-sans font-normal text-balance"
                    style={{
                      fontSize: "clamp(1.3rem, 2vw, 3rem)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span className="font-bold">{siteConfig.aboutName}</span>
                    <span
                      className="ms-2 inline font-normal tracking-wide opacity-70"
                      style={{
                        fontSize: "clamp(0.95rem, 1vw, 1.35rem)",
                        lineHeight: 1.4,
                      }}
                    >
                      {siteConfig.aboutPronouns}
                    </span>{" "}
                    {siteConfig.aboutLeadBody}
                  </p>
                  <p
                    className="font-sans font-semibold uppercase opacity-85"
                    style={{
                      fontSize: "clamp(0.7rem, 1.15vw, 0.95rem)",
                      letterSpacing: "0.14em",
                      lineHeight: 1.6,
                    }}
                  >
                    {siteConfig.aboutTagline}
                  </p>
                </div>
              </div>
            </section>
          </motion.div>
        </div>
      </div>

      <section
        className={cn(
          "relative z-10 px-5 py-16 sm:px-8 sm:py-24",
          projectsSurface,
        )}
        aria-labelledby="projects-heading"
      >
        <div className="mx-auto max-w-6xl">
          <h2
            id="projects-heading"
            className="font-sans text-4xl font-bold tracking-tight sm:text-5xl"
          >
            Selected work
          </h2>
          <p className="mt-4 max-w-xl font-sans text-base opacity-80 sm:text-lg">
            Project grid and case studies will live here — this section scrolls
            in naturally as the pinned hero releases above.
          </p>
        </div>
      </section>

      <section
        className={cn(
          "relative z-10 min-h-screen px-5 py-20 sm:px-8",
          projectsSurface,
          "border-t border-black/10 dark:border-white/10",
        )}
        aria-label="More projects"
      >
        <div className="mx-auto max-w-6xl font-sans">
          <p className="text-lg opacity-80">
            Additional projects and content after the pinned scroll — still{" "}
            {siteDark ? "dark" : "light"} surface to match the section above.
          </p>
        </div>
      </section>
    </>
  );
}
