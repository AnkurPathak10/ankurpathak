"use client";

import { ReactLenis } from "lenis/react";
import { type ReactNode, useSyncExternalStore } from "react";

function reducedMotionSubscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function reducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Smooth, inertial page scroll (Lenis). Keeps wheel/touch motion feeling continuous
 * for all sections — not only the pinned About sheet.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduceMotion = useSyncExternalStore(
    reducedMotionSubscribe,
    reducedMotionSnapshot,
    () => false,
  );

  return (
    <ReactLenis
      root
      options={{
        lerp: reduceMotion ? 1 : 0.078,
        smoothWheel: !reduceMotion,
        wheelMultiplier: 1,
        touchMultiplier: 1.12,
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
