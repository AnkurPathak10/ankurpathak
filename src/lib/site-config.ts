/** Central copy for SEO + hero; adjust here as your portfolio evolves. */
export const siteConfig = {
  name: "Ankur",
  /** Two-letter mark in the header chip (inspiration: initials) */
  initials: "AN",
  /** Shown in large display type; use spaces so screen readers phrase it naturally */
  headline: "Ankur Portfolio",
  titleTemplate: "%s · Ankur",
  defaultTitle: "Ankur · Developer & Designer",
  description:
    "Portfolio of Ankur — developer and designer focused on digital products, interfaces, and brands.",
  tagline:
    "Developer & designer — building digital products, interfaces, and brands.",
  /** Pill navbar (uppercase strip) */
  navTagline: "DESIGNING AND DEVELOPING DIGITAL PRODUCTS",
  /** Flowing menu rows (placeholders use picsum like the FlowingMenu demo) */
  navMenuItems: [
    {
      text: "LinkedIn",
      link: "#",
      image: "https://picsum.photos/600/400?random=1",
    },
    {
      text: "Github",
      link: "#",
      image: "https://picsum.photos/600/400?random=2",
    },
    {
      text: "Twitter",
      link: "#",
      image: "https://picsum.photos/600/400?random=3",
    },
    {
      text: "Instagram",
      link: "#",
      image: "https://picsum.photos/600/400?random=4",
    },
  ],
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** About section — scroll-reveal panel */
  aboutHeadingLine1: "About",
  aboutHeadingLine2: "Me ?",
  aboutName: "Ankur",
  aboutPronouns: "(HE/HIM)",
  aboutLeadBody:
    "is a full stack web developer and web designer, passionate in creating modern frontend designs and efficient backend architectures. He uses Next.js + TypeScript as primary tools to give life to one-of-a-kind stunning products. He is creating bugs since 2024 and currently resides in India, and he is ready to take on any product development challenge globally.",
  aboutTagline: "BUILDING PRODUCTS OF SOFTWARE - AI - SAAS",
} as const;
