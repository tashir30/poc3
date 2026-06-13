"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ADMIN_PREFETCH_ROUTES = [
  "/dashboard",
  "/products",
  "/categories",
  "/inventory",
  "/staff",
  "/activity",
  "/settings",
] as const;

const SALES_PREFETCH_ROUTES = ["/inventory", "/activity"] as const;

export function AdminRoutePrefetch({ role }: { role: "admin" | "sales" }) {
  const router = useRouter();

  useEffect(() => {
    const routes =
      role === "admin" ? ADMIN_PREFETCH_ROUTES : SALES_PREFETCH_ROUTES;
    for (const href of routes) {
      router.prefetch(href);
    }
  }, [router, role]);

  return null;
}
