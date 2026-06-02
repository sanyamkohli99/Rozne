import type { NavItemWithOptionalChildren } from "@/types";

import { slugify } from "@/lib/utils";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "ROZNE",
  description: "Ecommerce Application built with NextJS 14",
  url: "https://rozne.in",
  address: "1600 Amphitheatre Parkway in Mountain View, California",
  phone: "+1(234)-567-8901",
  email: "hello@rozne.in",
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
      title: "Brands & Designers",
      href: "/brands",
      description: "Discover our brands.",
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
