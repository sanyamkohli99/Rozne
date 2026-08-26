import type { SidebarNavItem } from "@/types";

export type DashboardConfig = {
  sidebarNav: SidebarNavItem[];
};

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: "layoutDashboard",
      items: [],
    },
    {
      title: "Products",
      href: "/admin/products",
      icon: "cart",
      items: [],
    },
    {
      title: "Promo Cards",
      href: "/admin/promo-cards",
      icon: "image",
      items: [],
    },
    {
      title: "Promo Codes",
      href: "/admin/promo-codes",
      icon: "tag",
      items: [],
    },
    {
      title: "Media Library",
      href: "/admin/medias",
      icon: "image",
      items: [],
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: "user",
      items: [],
    },
    {
      title: "Orders",
      href: "/admin/orders",
      icon: "receipt",
      items: [],
    },
  ],
};
