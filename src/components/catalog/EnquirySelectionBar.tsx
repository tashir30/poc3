"use client";

import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

interface EnquirySelectionBarProps {
  selectedCount: number;
  whatsappUrl: string;
  onClear: () => void;
}

export function EnquirySelectionBar({
  selectedCount,
  whatsappUrl,
  onClear,
}: EnquirySelectionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200/80 bg-white/95 px-4 py-3.5 shadow-[0_-12px_40px_rgba(17,24,39,0.12)] backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--catalog-ink)]">
          <span className="tabular-nums">{selectedCount}</span> selected
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-3 py-2 text-xs font-semibold text-stone-500 transition hover:text-[var(--catalog-accent)] sm:text-sm"
          >
            Clear
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--catalog-wa)] px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 sm:px-5 sm:text-sm"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Enquire on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
