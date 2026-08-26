"use server";

import db from "@/lib/supabase/db";
import { orders, profiles, products } from "@/lib/supabase/schema";
import { sql, and, eq, gte, lt, count } from "drizzle-orm";

export type MonthlyRevenue = { name: string; total: number };

export type RecentOrder = {
  name: string | null;
  email: string | null;
  amount: string;
  initials: string;
};

export type DashboardStats = {
  totalRevenue: number;
  revenueChangePercent: number | null;
  totalOrders: number;
  ordersChangePercent: number | null;
  totalCustomers: number;
  customersChangePercent: number | null;
  totalProducts: number;
  monthlyRevenue: MonthlyRevenue[];
  recentOrders: RecentOrder[];
  thisMonthOrderCount: number;
};

function initials(name: string | null, email: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "?";
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export async function getDashboardStats(): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalRevenue: 0,
    revenueChangePercent: null,
    totalOrders: 0,
    ordersChangePercent: null,
    totalCustomers: 0,
    customersChangePercent: null,
    totalProducts: 0,
    monthlyRevenue: MONTH_NAMES.map((name) => ({ name, total: 0 })),
    recentOrders: [],
    thisMonthOrderCount: 0,
  };

  try {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ── Revenue ────────────────────────────────────────────────────────────
    const [[totalRevenueRow], [thisMonthRevRow], [lastMonthRevRow]] =
      await Promise.all([
        db
          .select({ v: sql<string>`COALESCE(SUM(${orders.amount}::numeric), 0)` })
          .from(orders)
          .where(eq(orders.payment_status, "paid")),
        db
          .select({ v: sql<string>`COALESCE(SUM(${orders.amount}::numeric), 0)` })
          .from(orders)
          .where(
            and(
              eq(orders.payment_status, "paid"),
              gte(orders.createdAt, thisMonthStart),
            ),
          ),
        db
          .select({ v: sql<string>`COALESCE(SUM(${orders.amount}::numeric), 0)` })
          .from(orders)
          .where(
            and(
              eq(orders.payment_status, "paid"),
              gte(orders.createdAt, lastMonthStart),
              lt(orders.createdAt, thisMonthStart),
            ),
          ),
      ]);

    const totalRevenue = parseFloat(totalRevenueRow?.v ?? "0");
    const thisMonthRev = parseFloat(thisMonthRevRow?.v ?? "0");
    const lastMonthRev = parseFloat(lastMonthRevRow?.v ?? "0");

    // ── Orders ─────────────────────────────────────────────────────────────
    const [[totalOrdersRow], [thisMonthOrdRow], [lastMonthOrdRow]] =
      await Promise.all([
        db.select({ v: count() }).from(orders),
        db
          .select({ v: count() })
          .from(orders)
          .where(gte(orders.createdAt, thisMonthStart)),
        db
          .select({ v: count() })
          .from(orders)
          .where(
            and(
              gte(orders.createdAt, lastMonthStart),
              lt(orders.createdAt, thisMonthStart),
            ),
          ),
      ]);

    const totalOrders = totalOrdersRow?.v ?? 0;
    const thisMonthOrders = thisMonthOrdRow?.v ?? 0;
    const lastMonthOrders = lastMonthOrdRow?.v ?? 0;

    // ── Customers ──────────────────────────────────────────────────────────
    const [[totalCustomersRow], [thisMonthCustRow], [lastMonthCustRow]] =
      await Promise.all([
        db.select({ v: count() }).from(profiles),
        db
          .select({ v: count() })
          .from(profiles)
          .where(
            sql`${profiles.createdAt} >= ${thisMonthStart.toISOString()}`,
          ),
        db
          .select({ v: count() })
          .from(profiles)
          .where(
            sql`${profiles.createdAt} >= ${lastMonthStart.toISOString()} AND ${profiles.createdAt} < ${thisMonthStart.toISOString()}`,
          ),
      ]);

    const totalCustomers = totalCustomersRow?.v ?? 0;
    const thisMonthCustomers = thisMonthCustRow?.v ?? 0;
    const lastMonthCustomers = lastMonthCustRow?.v ?? 0;

    // ── Products ───────────────────────────────────────────────────────────
    const [totalProductsRow] = await db.select({ v: count() }).from(products);
    const totalProducts = totalProductsRow?.v ?? 0;

    // ── Monthly revenue chart (current year) ───────────────────────────────
    const monthlyRows = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${orders.createdAt})`,
        total: sql<string>`COALESCE(SUM(${orders.amount}::numeric), 0)`,
      })
      .from(orders)
      .where(
        and(
          eq(orders.payment_status, "paid"),
          gte(orders.createdAt, yearStart),
        ),
      )
      .groupBy(sql`EXTRACT(MONTH FROM ${orders.createdAt})`);

    const monthlyRevenue: MonthlyRevenue[] = MONTH_NAMES.map((name, i) => {
      const row = monthlyRows.find((r) => Number(r.month) === i + 1);
      return { name, total: parseFloat(row?.total ?? "0") };
    });

    // ── Recent orders (last 5) ─────────────────────────────────────────────
    const recentRows = await db
      .select({
        name: orders.name,
        email: orders.email,
        amount: orders.amount,
      })
      .from(orders)
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    const recentOrders: RecentOrder[] = recentRows.map((r) => ({
      name: r.name,
      email: r.email,
      amount: parseFloat(r.amount).toFixed(2),
      initials: initials(r.name, r.email),
    }));

    return {
      totalRevenue,
      revenueChangePercent: pctChange(thisMonthRev, lastMonthRev),
      totalOrders,
      ordersChangePercent: pctChange(thisMonthOrders, lastMonthOrders),
      totalCustomers,
      customersChangePercent: pctChange(thisMonthCustomers, lastMonthCustomers),
      totalProducts,
      monthlyRevenue,
      recentOrders,
      thisMonthOrderCount: thisMonthOrders,
    };
  } catch (err) {
    console.error("[getDashboardStats]", err);
    return empty;
  }
}
