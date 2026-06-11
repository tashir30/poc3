"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  fullWidth,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition disabled:opacity-50";
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-brand-orange-dark",
    secondary:
      "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    outline:
      "border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/5",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-base outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1 block text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <main className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
            Catalog Platform
          </p>
          <h1 className="font-display mt-2 text-3xl font-bold uppercase tracking-tight text-brand-navy">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-slate-600">{subtitle}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </div>
      </div>
    </main>
  );
}
