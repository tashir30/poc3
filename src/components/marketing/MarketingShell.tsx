import Link from "next/link";

export function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full bg-[#0b1220] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            Elevo
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/pricing" className="text-slate-300 hover:text-white">
              Pricing
            </Link>
            <Link
              href="/staff-login"
              className="hidden text-slate-400 hover:text-white sm:inline"
            >
              Staff login
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
            >
              Start free
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-400">
        <p>© {new Date().getFullYear()} Elevo. Catalog + inventory for small businesses.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
