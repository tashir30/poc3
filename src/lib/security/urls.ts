import "server-only";

const UPLOAD_PATH =
  /^\/uploads\/([0-9a-f-]{36})\/([0-9a-f-]{36})\.(jpg|jpeg|png|webp)$/i;

function supabasePublicImagePath(): RegExp | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) {
    return null;
  }

  const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(
    `^${escaped}/storage/v1/object/public/product-images/([0-9a-f-]{36})/([0-9a-f-]{36})\\.(jpg|jpeg|png|webp)$`,
    "i",
  );
}

export function validateProductImageUrl(
  imageUrl: string | null,
  businessId: string,
): string | null {
  if (!imageUrl) {
    return null;
  }

  const trimmed = imageUrl.trim().slice(0, 300);

  if (trimmed.startsWith("/uploads/")) {
    const match = UPLOAD_PATH.exec(trimmed);
    if (!match || match[1] !== businessId) {
      return null;
    }
    return trimmed;
  }

  const supabasePattern = supabasePublicImagePath();
  if (supabasePattern) {
    const match = supabasePattern.exec(trimmed);
    if (match && match[1] === businessId) {
      return trimmed;
    }
  }

  return null;
}

export function validateProductImageUrls(
  imageUrls: string[],
  businessId: string,
  maxCount: number,
): string[] {
  const validated: string[] = [];
  for (const raw of imageUrls) {
    if (validated.length >= maxCount) break;
    const url = validateProductImageUrl(raw, businessId);
    if (url) validated.push(url);
  }
  return validated;
}
