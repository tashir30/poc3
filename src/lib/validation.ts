import { LIMITS } from "./constants";

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length < LIMITS.phoneMin || digits.length > LIMITS.phoneMax) {
    return null;
  }
  return digits;
}

export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, LIMITS.slugMax);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{2,80}$/.test(slug);
}

const RESERVED_SLUGS = new Set([
  "login",
  "staff-login",
  "onboarding",
  "dashboard",
  "products",
  "categories",
  "inventory",
  "staff",
  "activity",
  "pricing",
  "terms",
  "privacy",
  "platform",
  "account",
  "api",
  "settings",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

export function phoneToEmail(phone: string): string {
  return `${phone}@poc3.local`;
}

export function sanitizeText(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

export function whatsappNumberForLink(number: string): string {
  return number.replace(/\D/g, "").slice(0, LIMITS.phoneMax);
}

function sanitizeMessageField(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen).replace(/[\r\n<>]/g, "");
}

export interface EnquiryProduct {
  name: string;
  priceText: string;
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string,
): string {
  const phone = whatsappNumberForLink(whatsappNumber);
  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${phone}?text=${encoded}`;
  if (url.length > LIMITS.maxWhatsAppUrlLength) {
    return `https://wa.me/${phone}`;
  }
  return url;
}

export function buildProductEnquiryMessage(
  productName: string,
  businessName: string,
  priceText?: string,
): string {
  const safeName = sanitizeMessageField(productName, LIMITS.productNameMax);
  const safeBusiness = sanitizeMessageField(businessName, LIMITS.businessNameMax);
  const safePrice = priceText
    ? sanitizeMessageField(priceText, LIMITS.priceTextMax)
    : "";

  if (safePrice) {
    return `Hello, I am interested in ${safeName} (${safePrice}) from ${safeBusiness}.`;
  }

  return `Hello, I am interested in ${safeName} from ${safeBusiness}.`;
}

export function buildMultiProductEnquiryMessage(
  products: EnquiryProduct[],
  businessName: string,
): string {
  const safeBusiness = sanitizeMessageField(businessName, LIMITS.businessNameMax);
  const limited = products.slice(0, LIMITS.maxEnquiryProducts);

  const lines = limited.map((product) => {
    const safeName = sanitizeMessageField(product.name, LIMITS.productNameMax);
    const safePrice = sanitizeMessageField(
      product.priceText,
      LIMITS.priceTextMax,
    );
    return safePrice ? `• ${safeName} — ${safePrice}` : `• ${safeName}`;
  });

  return [
    `Hello, I am interested in the following from ${safeBusiness}:`,
    "",
    ...lines,
    "",
    "Please share availability and total.",
  ].join("\n");
}

export function buildCatalogEnquiryMessage(businessName: string): string {
  const safeBusiness = sanitizeMessageField(businessName, LIMITS.businessNameMax);
  return `Hello, I am interested in products from ${safeBusiness}.`;
}

export function normalizeInstagramUrl(input: string): string | null {
  const trimmed = input.trim().slice(0, LIMITS.instagramUrlMax);
  if (!trimmed) return null;

  let handle = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const host = url.hostname.replace(/^www\./i, "").toLowerCase();
      if (host !== "instagram.com") return null;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length === 0 || parts[0] === "p" || parts[0] === "reel") {
        return null;
      }
      handle = parts[0] ?? "";
    } catch {
      return null;
    }
  } else {
    handle = handle.replace(/^@/, "");
  }

  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) {
    return null;
  }

  return `https://instagram.com/${handle}`;
}
