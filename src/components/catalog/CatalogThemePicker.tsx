"use client";

import { useEffect, useState, useTransition } from "react";
import {
  CATALOG_THEMES,
  type CatalogThemeId,
} from "@/lib/catalog-themes";
import { updateCatalogTheme } from "@/lib/actions/catalog";

interface CatalogThemePickerProps {
  currentTheme: CatalogThemeId;
  catalogUrl: string;
  isAdmin: boolean;
}

export function CatalogThemePicker({
  currentTheme,
  catalogUrl,
  isAdmin,
}: CatalogThemePickerProps) {
  const [selected, setSelected] = useState<CatalogThemeId>(currentTheme);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSelected(currentTheme);
  }, [currentTheme]);

  if (!isAdmin) {
    return null;
  }

  function handleSelect(themeId: CatalogThemeId) {
    if (themeId === selected || isPending) {
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await updateCatalogTheme(themeId);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setSelected(themeId);
      setMessage("Theme updated — refresh your catalog tab to preview.");
    });
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
            Catalog theme
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Choose colors for your public storefront.
          </p>
        </div>
        <a
          href={catalogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold uppercase tracking-wide text-brand-navy hover:text-brand-orange"
        >
          Preview →
        </a>
      </div>

      {isPending ? (
        <p className="mt-2 text-xs font-medium text-slate-500" role="status">
          Saving theme...
        </p>
      ) : null}

      <div
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
        aria-busy={isPending}
      >
        {CATALOG_THEMES.map((theme) => {
          const active = selected === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(theme.id)}
              aria-pressed={active}
              className={`rounded-xl border p-3 text-left transition disabled:opacity-60 ${
                active
                  ? "border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/30"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex gap-1">
                {theme.preview.map((color, index) => (
                  <span
                    key={`${theme.id}-${index}`}
                    className="h-5 w-5 rounded-full border border-black/10"
                    style={{ backgroundColor: color }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-2 text-sm font-semibold text-brand-navy">
                {theme.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>

      {message ? (
        <p
          className={`mt-3 text-xs ${
            message.startsWith("Theme updated")
              ? "text-emerald-700"
              : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
