"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { Card } from "@/components/ui/Form";

interface DashboardStatLinkProps {
  href: string;
  label: string;
  value: number;
  alert?: boolean;
}

function StatCard({
  label,
  value,
  alert,
}: Omit<DashboardStatLinkProps, "href">) {
  const { pending } = useLinkStatus();

  return (
    <Card
      className={`h-full w-full transition hover:border-brand-orange/40 hover:shadow-md ${
        pending ? "opacity-60" : ""
      } ${alert ? "border-brand-orange/30 bg-brand-orange/5" : ""}`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
        {label}
      </p>
      <p
        className={`font-display mt-1 text-3xl font-bold ${
          alert ? "text-brand-orange" : "text-brand-navy"
        }`}
      >
        {value}
      </p>
      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 opacity-0 transition group-hover:opacity-100">
        View →
      </p>
    </Card>
  );
}

export function DashboardStatLink({
  href,
  label,
  value,
  alert,
}: DashboardStatLinkProps) {
  return (
    <Link href={href} className="group block h-full w-full min-w-0">
      <StatCard label={label} value={value} alert={alert} />
    </Link>
  );
}
