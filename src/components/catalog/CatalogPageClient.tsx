"use client";

import { useMemo, useState } from "react";
import type { Category, PublicProduct } from "@/types/database";
import { LIMITS } from "@/lib/constants";
import {
  buildMultiProductEnquiryMessage,
  buildWhatsAppUrl,
} from "@/lib/validation";
import { CatalogBrowser } from "./CatalogBrowser";
import { EnquirySelectionBar } from "./EnquirySelectionBar";
import { FloatingWhatsApp } from "./FloatingWhatsApp";

interface CatalogPageClientProps {
  slug: string;
  products: PublicProduct[];
  categories: Category[];
  whatsappNumber: string;
  businessName: string;
}

export function CatalogPageClient({
  slug,
  products,
  categories,
  whatsappNumber,
  businessName,
}: CatalogPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [selectionLimitReached, setSelectionLimitReached] = useState(false);

  const selectedProducts = useMemo(
    () => products.filter((product) => selectedIds.has(product.id)),
    [products, selectedIds],
  );

  const multiEnquiryUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildMultiProductEnquiryMessage(
      selectedProducts.map((product) => ({
        name: product.name,
        priceText: product.price_text,
      })),
      businessName,
    ),
  );

  function toggleProduct(productId: string) {
    setSelectionLimitReached(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        return next;
      }
      if (next.size >= LIMITS.maxEnquiryProducts) {
        setSelectionLimitReached(true);
        return prev;
      }
      next.add(productId);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setSelectionLimitReached(false);
  }

  return (
    <>
      <CatalogBrowser
        slug={slug}
        products={products}
        categories={categories}
        businessName={businessName}
        whatsappNumber={whatsappNumber}
        selectedIds={selectedIds}
        onToggleProduct={toggleProduct}
        selectionActive={selectedIds.size > 0}
        selectionLimitReached={selectionLimitReached}
      />

      {selectedIds.size === 0 ? (
        <FloatingWhatsApp
          whatsappNumber={whatsappNumber}
          businessName={businessName}
        />
      ) : null}

      <EnquirySelectionBar
        selectedCount={selectedIds.size}
        whatsappUrl={multiEnquiryUrl}
        onClear={clearSelection}
      />
    </>
  );
}
