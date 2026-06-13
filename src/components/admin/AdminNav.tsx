"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";
import { NavLink } from "./NavLink";

interface AdminNavProps {
  role: "admin" | "sales";
}

const adminLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/inventory", label: "Inventory" },
  { href: "/staff", label: "Staff" },
  { href: "/activity", label: "Activity" },
  { href: "/settings", label: "Settings" },
];

const salesLinks = [
  { href: "/inventory", label: "Inventory" },
  { href: "/activity", label: "Activity" },
];

export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : salesLinks;

  return (
    <nav
      className="border-b border-slate-200 bg-white px-2 py-2 sm:px-4"
      aria-label="Admin"
    >
      <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto scrollbar-none">
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(link.href);

          return (
            <NavLink
              key={link.href}
              href={link.href}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold uppercase tracking-wide transition sm:text-sm ${
                active
                  ? "bg-brand-navy text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy"
              }`}
            >
              {link.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function AdminHeader({
  title,
  businessName,
}: {
  title: string;
  businessName?: string;
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-brand-orange">
            {businessName ?? "Catalog Platform"}
          </p>
          <h1 className="font-display truncate text-lg font-bold uppercase tracking-tight text-brand-navy sm:text-xl">
            {title}
          </h1>
        </div>
        <LogoutButton />
      </div>
      <div className="h-0.5 bg-brand-orange" aria-hidden="true" />
    </header>
  );
}

export function AdminShell({
  title,
  businessName,
  role,
  children,
}: {
  title: string;
  businessName: string;
  role: "admin" | "sales";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-background">
      <AdminHeader title={title} businessName={businessName} />
      <AdminNav role={role} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
    </div>
  );
}
