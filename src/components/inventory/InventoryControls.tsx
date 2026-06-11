"use client";

import { useTransition } from "react";
import { updateInventory } from "@/lib/actions/catalog";

interface InventoryControlsProps {
  productId: string;
  stockQuantity: number;
}

export function InventoryControls({
  productId,
  stockQuantity,
}: InventoryControlsProps) {
  const [pending, startTransition] = useTransition();

  function adjust(
    amount: number,
    actionType: "SALE" | "STOCK_ADDED" | "MANUAL_ADJUSTMENT",
  ) {
    startTransition(async () => {
      await updateInventory(productId, amount, actionType);
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600">
        Current stock:{" "}
        <span className="font-display text-lg font-bold text-brand-navy">
          {stockQuantity}
        </span>
      </p>
      <div className="grid grid-cols-4 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => adjust(-5, "SALE")}
          className="min-h-11 rounded-full border-2 border-slate-300 bg-white text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          -5
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => adjust(-1, "SALE")}
          className="min-h-11 rounded-full border-2 border-slate-300 bg-white text-sm font-bold uppercase tracking-wide text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          -1
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => adjust(1, "STOCK_ADDED")}
          className="min-h-11 rounded-full bg-brand-orange text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-orange-dark disabled:opacity-50"
        >
          +1
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => adjust(5, "STOCK_ADDED")}
          className="min-h-11 rounded-full bg-brand-orange text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-orange-dark disabled:opacity-50"
        >
          +5
        </button>
      </div>
    </div>
  );
}
