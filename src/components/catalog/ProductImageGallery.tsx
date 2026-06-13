"use client";

import { useState } from "react";

interface ProductImageGalleryProps {
  images: string[];
  alt: string;
}

export function ProductImageGallery({ images, alt }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = images.length > 0 ? Math.min(activeIndex, images.length - 1) : 0;
  const activeImage = images[safeIndex];

  if (images.length === 0) {
    return (
      <div className="catalog-card flex aspect-[4/5] items-center justify-center bg-white text-sm text-[var(--catalog-muted)] lg:aspect-square">
        No photo available
      </div>
    );
  }

  return (
    <div className="catalog-card overflow-hidden bg-white">
      <div className="relative aspect-[4/5] bg-white lg:aspect-square">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImage}
          alt={alt}
          className="h-full w-full object-contain p-4 sm:p-6"
        />
        {images.length > 1 ? (
          <p className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-medium text-white">
            {safeIndex + 1} / {images.length}
          </p>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-stone-100 p-3 scrollbar-none sm:p-4">
          {images.map((url, index) => {
            const selected = index === safeIndex;
            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-white sm:h-20 sm:w-20 ${
                  selected
                    ? "border-[var(--catalog-ink)] ring-1 ring-[var(--catalog-ink)]"
                    : "border-stone-200 hover:border-stone-300"
                }`}
                aria-label={`Show image ${index + 1}`}
                aria-pressed={selected}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
