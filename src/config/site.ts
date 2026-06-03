import type { NavItemWithOptionalChildren } from "@/types";

import { slugify } from "@/lib/utils";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ROZNE",
  description: "Premium Hosiery Garments — Manufacturer from Ludhiana, Punjab",
  url: "https://rozne.in",
  address: "B-34/3339, Shakti Vihar, Chander Nagar, Ludhiana (Pb.) INDIA",
  phone: "+91 884 7570 473",
  email: "krsapparels39@gmail.com",
  mainNav: [
    {
      title: "Shop",
      href: "/shop",
      description: "All the products we have to offer.",
      items: [],
    },
    {
      title: "Our Story",
      href: "/our-story",
      description: "Our Story.",
      items: [],
    },
    {
      title: "Collections",
      href: "/brands",
      description: "Discover our collections.",
      items: [],
    },
    {
      title: "Contact",
      href: "/contact",
      description: "Get in touch with us.",
      items: [],
    },
  ] satisfies NavItemWithOptionalChildren[],
};
