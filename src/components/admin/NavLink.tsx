"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";

interface NavLinkProps {
  href: string;
  className?: string;
  pendingClassName?: string;
  children: React.ReactNode;
}

function NavLinkContent({
  className,
  pendingClassName,
  children,
}: {
  className: string;
  pendingClassName: string;
  children: React.ReactNode;
}) {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`inline-flex items-center ${className} ${
        pending ? pendingClassName : ""
      }`.trim()}
      aria-busy={pending}
    >
      {children}
      {pending ? (
        <span className="ml-1.5 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
    </span>
  );
}

export function NavLink({
  href,
  className = "",
  pendingClassName = "opacity-60",
  children,
}: NavLinkProps) {
  return (
    <Link href={href} className="shrink-0">
      <NavLinkContent className={className} pendingClassName={pendingClassName}>
        {children}
      </NavLinkContent>
    </Link>
  );
}
