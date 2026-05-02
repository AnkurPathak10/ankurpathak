import Image from "next/image";
import { siteConfig } from "@/lib/site-config";

const MARQUEE_VISUAL = "ANKUR PATHAK";

export function Hero() {
  return (
    <div className="hero-surface relative isolate min-h-screen w-full overflow-x-hidden">
      <h1 className="sr-only">Ankur Pathak</h1>

      <div className="hero-marquee-clip select-none" aria-hidden>
        <div className="hero-marquee-shell">
          <div className="hero-marquee-track">
            <span className="hero-marquee-item">{MARQUEE_VISUAL}</span>
            <span className="hero-marquee-item">{MARQUEE_VISUAL}</span>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-1/2 z-10 h-screen w-[60vw] max-w-[96vw] -translate-x-1/2 overflow-hidden">
        <Image
          src="/avatar.png"
          alt={`Portrait of ${siteConfig.name}`}
          fill
          className="object-cover object-[center_-10%] select-none scale-[1]"
          sizes="(max-width: 768px) 96vw, 58vw"
          priority
        />
      </div>
    </div>
  );
}
