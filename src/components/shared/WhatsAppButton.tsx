import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

interface WhatsAppButtonProps {
  href: string;
  label?: ReactNode;
  variant?: "primary" | "outline";
  size?: "sm" | "md";
  className?: string;
}

export function WhatsAppButton({
  href,
  label = "Enquire on WhatsApp",
  variant = "primary",
  size = "md",
  className = "",
}: WhatsAppButtonProps) {
  const sizeStyles =
    size === "sm"
      ? "gap-1.5 px-3.5 py-1.5 text-xs"
      : "gap-1.5 px-4 py-2 text-sm";
  const base = `inline-flex items-center justify-center rounded-full font-semibold tracking-wide transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-orange ${sizeStyles}`;
  const styles =
    variant === "primary"
      ? "bg-brand-orange text-white hover:bg-brand-orange-dark"
      : "border border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-700";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${styles} ${className}`}
    >
      <WhatsAppIcon
        className={variant === "outline" ? "h-3.5 w-3.5 text-emerald-600" : "h-3.5 w-3.5"}
      />
      {label}
    </a>
  );
}
