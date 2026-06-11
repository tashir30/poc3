export const CATALOG_THEME_IDS = [
  "warm",
  "ocean",
  "forest",
  "rose",
  "slate",
  "bold",
] as const;

export type CatalogThemeId = (typeof CATALOG_THEME_IDS)[number];

export interface CatalogThemeDefinition {
  id: CatalogThemeId;
  label: string;
  description: string;
  preview: [string, string, string];
}

export const CATALOG_THEMES: CatalogThemeDefinition[] = [
  {
    id: "warm",
    label: "Warm",
    description: "Stone background with orange accents",
    preview: ["#f4f1ec", "#c2410c", "#111827"],
  },
  {
    id: "ocean",
    label: "Ocean",
    description: "Cool blues with a clean storefront feel",
    preview: ["#eef4f8", "#0284c7", "#0c4a6e"],
  },
  {
    id: "forest",
    label: "Forest",
    description: "Natural greens for wellness and organic brands",
    preview: ["#f0f4f0", "#166534", "#14532d"],
  },
  {
    id: "rose",
    label: "Rose",
    description: "Soft blush tones with bold rose highlights",
    preview: ["#faf5f5", "#be123c", "#881337"],
  },
  {
    id: "slate",
    label: "Slate",
    description: "Minimal grey palette for a professional look",
    preview: ["#f1f5f9", "#475569", "#0f172a"],
  },
  {
    id: "bold",
    label: "Bold",
    description: "High-contrast black and white, e-commerce style",
    preview: ["#ffffff", "#000000", "#25d366"],
  },
];

export const DEFAULT_CATALOG_THEME: CatalogThemeId = "warm";

export function isValidCatalogTheme(value: string): value is CatalogThemeId {
  return (CATALOG_THEME_IDS as readonly string[]).includes(value);
}

export function resolveCatalogTheme(value: string | null | undefined): CatalogThemeId {
  if (value && isValidCatalogTheme(value)) {
    return value;
  }
  return DEFAULT_CATALOG_THEME;
}

export function getCatalogThemeDefinition(
  themeId: CatalogThemeId,
): CatalogThemeDefinition {
  return (
    CATALOG_THEMES.find((theme) => theme.id === themeId) ??
    CATALOG_THEMES[0]
  );
}
