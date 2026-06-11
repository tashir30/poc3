interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
}

export function SectionTitle({
  title,
  subtitle,
  centered = true,
}: SectionTitleProps) {
  return (
    <div className={centered ? "text-center" : ""}>
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-brand-navy sm:text-3xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-slate-600 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
