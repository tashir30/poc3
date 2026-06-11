"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { refreshSessionCookie } from "@/lib/auth/local";
import { getSessionFromCookie } from "@/lib/auth/cookies";
import { LIMITS } from "@/lib/constants";
import { isValidCatalogTheme } from "@/lib/catalog-themes";
import { getPlanLimits } from "@/lib/plans";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext, requireMerchantAdmin } from "@/lib/session";
import { validateProductImageUrl } from "@/lib/security/urls";
import {
  detectImageType,
} from "@/lib/security/image";
import { uploadProductImage as storeProductImage } from "@/lib/storage/upload";
import {
  isValidSlug,
  isReservedSlug,
  normalizePhone,
  sanitizeText,
  slugify,
} from "@/lib/validation";

async function requireAdmin() {
  return requireMerchantAdmin();
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
  const { business } = await requireAdmin();

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

  await repo.insertProduct({
    businessId: business.id,
    categoryId,
    name,
    description: description || null,
    priceText,
    imageUrl,
  });

  revalidatePath("/products");
  revalidatePath(`/${business.slug}`);
  redirect("/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const { business } = await requireAdmin();

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

  revalidatePath("/products");
  revalidatePath(`/${business.slug}`);
  redirect("/products");
}

export async function deleteProduct(productId: string): Promise<void> {
  const { business } = await requireAdmin();

  if (!(await repo.deleteProductById(productId, business.id))) {
    throw new Error("Product not found");
  }

  revalidatePath("/products");
  revalidatePath(`/${business.slug}`);
}

export async function uploadProductImage(formData: FormData) {
  const { business } = await requireAdmin();

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
  const ctx = await requireBusinessContext();
  const limits = getPlanLimits(ctx.business.plan);
  const activityToday = await repo.countDailyActivity(ctx.business.id);

  if (activityToday >= limits.maxDailyActivity) {
    return {
      error: `Daily activity limit reached (${limits.maxDailyActivity}/day). Upgrade your plan to continue.`,
      limitReached: true,
    };
  }

  const product = await repo.getProductStock(productId, ctx.business.id);

  if (!product) return { error: "Product not found" };

  const newStock = Math.max(0, product.stock_quantity + changeAmount);

  if (!(await repo.updateProductStock(productId, ctx.business.id, newStock))) {
    return { error: "Failed to update stock" };
  }

  await repo.insertInventoryLog({
    productId,
    userId:
      ctx.session.accountType === "merchant" ? ctx.session.userId ?? null : null,
    staffAccountId:
      ctx.session.accountType === "staff" ? ctx.session.staffId ?? null : null,
    changeAmount,
    actionType,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  revalidatePath("/activity");
  return { ok: true, stock: newStock };
}

export async function updateCatalogTheme(themeId: string) {
  const ctx = await requireAdmin();

  if (!isValidCatalogTheme(themeId)) {
    return { error: "Invalid catalog theme" };
  }

  await repo.updateBusinessCatalogTheme(ctx.business.id, themeId);
  revalidatePath("/dashboard");
  revalidatePath(`/${ctx.business.slug}`);

  return { ok: true, themeId };
}
