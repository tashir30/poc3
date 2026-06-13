"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { refreshSessionCookie } from "@/lib/auth/local";
import { getSessionFromCookie } from "@/lib/auth/cookies";
import { LIMITS } from "@/lib/constants";
import { isValidCatalogTheme } from "@/lib/catalog-themes";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireMerchantAdmin, getActionAdminContext, getActionBusinessContext } from "@/lib/session";
import { validateProductImageUrl } from "@/lib/security/urls";
import {
  detectImageType,
} from "@/lib/security/image";
import { uploadProductImage as storeProductImage } from "@/lib/storage/upload";
import {
  isValidSlug,
  isReservedSlug,
  normalizePhone,
  normalizeInstagramUrl,
  sanitizeText,
  slugify,
} from "@/lib/validation";

async function requireAdmin() {
  return requireMerchantAdmin();
}

function revalidateCatalogProductPaths(businessSlug: string, productId?: string) {
  revalidatePath("/products");
  revalidatePath(`/${businessSlug}`);
  if (productId) {
    revalidatePath(`/${businessSlug}/product/${productId}`);
  }
}

function revalidateBusinessPaths(businessSlug: string) {
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath(`/${businessSlug}`);
}

export async function createBusiness(formData: FormData) {
  const session = await getSessionFromCookie();
  if (!session || session.accountType !== "merchant" || !session.userId) {
    redirect("/login");
  }

  const existingProfile = await repo.getProfileById(session.userId);
  if (existingProfile?.business_id) {
    return { error: "You already have a business linked to this account" };
  }

  const name = sanitizeText(formData.get("name")?.toString() ?? "", LIMITS.businessNameMax);
  const whatsapp = normalizePhone(
    formData.get("whatsapp_number")?.toString() ?? "",
  );
  let slug = sanitizeText(formData.get("slug")?.toString() ?? "", LIMITS.slugMax);

  if (!name || !whatsapp) {
    return { error: "Business name and a valid WhatsApp number are required" };
  }

  if (!slug) slug = slugify(name);
  if (!isValidSlug(slug)) {
    return { error: "Invalid catalog URL slug" };
  }

  if (isReservedSlug(slug)) {
    return { error: "This catalog URL is reserved" };
  }

  if (await repo.slugExists(slug)) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }

  const business = await repo.createBusiness({
    ownerUserId: session.userId,
    name,
    slug,
    whatsappNumber: whatsapp,
  });

  await repo.updateProfile(session.userId, {
    business_id: business.id,
    role: "admin",
  });

  await refreshSessionCookie(session.userId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateBusinessSettings(formData: FormData) {
  const auth = await getActionAdminContext();
  if (!auth.ok) return { error: auth.error };
  const { business } = auth;

  const name = sanitizeText(formData.get("name")?.toString() ?? "", LIMITS.businessNameMax);
  const whatsapp = normalizePhone(formData.get("whatsapp_number")?.toString() ?? "");
  const description = sanitizeText(
    formData.get("description")?.toString() ?? "",
    500,
  );
  const instagramRaw = formData.get("instagram_url")?.toString() ?? "";
  const instagramUrl = instagramRaw.trim()
    ? normalizeInstagramUrl(instagramRaw)
    : null;

  if (!name) return { error: "Business name is required" };
  if (!whatsapp) return { error: "A valid WhatsApp number is required" };
  if (instagramRaw.trim() && !instagramUrl) {
    return { error: "Enter a valid Instagram handle or profile URL" };
  }

  try {
    if (
      !(await repo.updateBusinessById(business.id, {
        name,
        whatsappNumber: whatsapp,
        description: description || null,
        instagramUrl,
      }))
    ) {
      return { error: "Failed to update business profile" };
    }
  } catch {
    return { error: "Could not save changes. Try again in a moment." };
  }

  revalidateBusinessPaths(business.slug);
  return { ok: true };
}

export async function createCategory(formData: FormData): Promise<void> {
  const { business } = await requireAdmin();

  const limits = getPlanLimits(business.plan);
  if ((await repo.countCategories(business.id)) >= limits.maxCategories) {
    throw new Error(
      `Plan limit reached: up to ${limits.maxCategories} categories. Upgrade to add more.`,
    );
  }

  const name = sanitizeText(formData.get("name")?.toString() ?? "", LIMITS.categoryNameMax);
  const description = sanitizeText(
    formData.get("description")?.toString() ?? "",
    300,
  );

  if (!name) throw new Error("Category name is required");

  await repo.insertCategory({
    businessId: business.id,
    name,
    description: description || null,
  });

  revalidatePath("/categories");
  revalidatePath(`/${business.slug}`);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const { business } = await requireAdmin();

  if (!(await repo.deleteCategoryById(categoryId, business.id))) {
    throw new Error("Category not found");
  }

  revalidatePath("/categories");
  revalidatePath(`/${business.slug}`);
}

export async function createProduct(formData: FormData) {
  const auth = await getActionAdminContext();
  if (!auth.ok) return { error: auth.error };
  const { business } = auth;

  const limits = getPlanLimits(business.plan);
  if ((await repo.countProducts(business.id)) >= limits.maxProducts) {
    return {
      error: `Plan limit reached: up to ${limits.maxProducts} products. Upgrade to add more.`,
    };
  }

  const name = sanitizeText(formData.get("name")?.toString() ?? "", LIMITS.productNameMax);
  const description = sanitizeText(
    formData.get("description")?.toString() ?? "",
    LIMITS.productDescriptionMax,
  );
  const priceText = sanitizeText(
    formData.get("price_text")?.toString() ?? "Contact for Price",
    LIMITS.priceTextMax,
  );
  const categoryId = formData.get("category_id")?.toString() || null;
  const imageUrl = validateProductImageUrl(
    formData.get("image_url")?.toString() || null,
    business.id,
  );

  if (!name) return { error: "Product name is required" };

  if (categoryId && !(await repo.categoryBelongsToBusiness(categoryId, business.id))) {
    return { error: "Invalid category" };
  }

  const active = formData.get("active") === "on";

  await repo.insertProduct({
    businessId: business.id,
    categoryId,
    name,
    description: description || null,
    priceText,
    imageUrl,
    active,
  });

  revalidateCatalogProductPaths(business.slug);
  redirect("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const auth = await getActionAdminContext();
  if (!auth.ok) return { error: auth.error };
  const { business } = auth;

  const name = sanitizeText(formData.get("name")?.toString() ?? "", LIMITS.productNameMax);
  const description = sanitizeText(
    formData.get("description")?.toString() ?? "",
    LIMITS.productDescriptionMax,
  );
  const priceText = sanitizeText(
    formData.get("price_text")?.toString() ?? "",
    LIMITS.priceTextMax,
  );
  const categoryId = formData.get("category_id")?.toString() || null;
  const imageUrl = validateProductImageUrl(
    formData.get("image_url")?.toString() || null,
    business.id,
  );
  const active = formData.get("active") === "on";

  if (!name || !priceText) return { error: "Name and price are required" };

  if (categoryId && !(await repo.categoryBelongsToBusiness(categoryId, business.id))) {
    return { error: "Invalid category" };
  }

  if (
    !(await repo.updateProductById(productId, business.id, {
      name,
      description: description || null,
      priceText,
      categoryId,
      imageUrl,
      active,
    }))
  ) {
    return { error: "Product not found" };
  }

  revalidateCatalogProductPaths(business.slug, productId);
  redirect("/products");
}

export async function deleteProduct(productId: string): Promise<void> {
  const { business } = await requireAdmin();

  if (!(await repo.deleteProductById(productId, business.id))) {
    throw new Error("Product not found");
  }

  revalidateCatalogProductPaths(business.slug, productId);
}

export async function uploadProductImage(formData: FormData) {
  const auth = await getActionAdminContext();
  if (!auth.ok) return { error: auth.error };
  const { business } = auth;

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "No file provided" };
  }

  if (file.size > LIMITS.imageMaxBytes) {
    return { error: "Image must be under 2MB" };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    return { error: "Only JPEG, PNG, and WebP images are allowed" };
  }

  const { url } = await storeProductImage(business.id, buffer);

  return { url };
}

export async function updateInventory(
  productId: string,
  changeAmount: number,
  actionType: "SALE" | "STOCK_ADDED" | "MANUAL_ADJUSTMENT",
) {
  const auth = await getActionBusinessContext();
  if (!auth.ok) return { error: auth.error };
  const { business, session } = auth;
  const limits = getPlanLimits(business.plan);
  const activityToday = await repo.countDailyActivity(business.id);

  if (activityToday >= limits.maxDailyActivity) {
    return {
      error: `Daily activity limit reached (${limits.maxDailyActivity}/day). Upgrade your plan to continue.`,
      limitReached: true,
    };
  }

  const product = await repo.getProductStock(productId, business.id);

  if (!product) return { error: "Product not found" };

  const newStock = Math.max(0, product.stock_quantity + changeAmount);

  if (!(await repo.updateProductStock(productId, business.id, newStock))) {
    return { error: "Failed to update stock" };
  }

  await repo.insertInventoryLog({
    productId,
    userId: session.accountType === "merchant" ? session.userId ?? null : null,
    staffAccountId:
      session.accountType === "staff" ? session.staffId ?? null : null,
    changeAmount,
    actionType,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  return { ok: true, stock: newStock };
}

export async function updateCatalogTheme(themeId: string) {
  const auth = await getActionAdminContext();
  if (!auth.ok) return { error: auth.error };

  if (!isValidCatalogTheme(themeId)) {
    return { error: "Invalid catalog theme" };
  }

  await repo.updateBusinessCatalogTheme(auth.business.id, themeId);
  revalidateBusinessPaths(auth.business.slug);

  return { ok: true, themeId };
}
