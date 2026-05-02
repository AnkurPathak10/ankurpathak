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
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;
