import { PLANS } from "@/lib/plans";

export const FREE_PLAN = PLANS.free;

export const LOW_STOCK_THRESHOLD = 5;

export const LIMITS = {
  phoneMin: 8,
  phoneMax: 20,
  businessNameMax: 120,
  slugMax: 80,
  productNameMax: 120,
  productDescriptionMax: 1000,
  categoryNameMax: 80,
  priceTextMax: 80,
  imageMaxBytes: 2 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  maxEnquiryProducts: 20,
  maxWhatsAppUrlLength: 1800,
} as const;

export const OTP_TTL_MS = 10 * 60 * 1000;
