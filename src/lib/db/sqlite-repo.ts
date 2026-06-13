import "server-only";

import type {
  Business,
  CatalogThemeId,
  Category,
  InventoryLog,
  Product,
  Profile,
  PublicProduct,
  StaffAccount,
  StaffStatus,
  Subscription,
  User,
  UserRole,
} from "@/types/database";
import { boolFromDb, boolToDb, getDb, newId } from "./connection";
import { resolveCatalogTheme } from "@/lib/catalog-themes";
import { resolveBusinessPlan } from "@/lib/plans";

type ProductRow = Product & { active: number | boolean };

type UserRow = User & {
  must_change_password: number | boolean;
  is_platform_admin: number | boolean;
};

type StaffRow = StaffAccount & {
  must_change_password: number | boolean;
};

function mapBusiness(
  row: Business & { catalog_theme?: string | null; plan?: string | null },
): Business {
  return {
    ...row,
    catalog_theme: resolveCatalogTheme(row.catalog_theme),
    plan: resolveBusinessPlan(row.plan),
    plan_status: row.plan_status ?? "active",
    plan_expires_at: row.plan_expires_at ?? null,
    timezone: row.timezone ?? "Asia/Kolkata",
    instagram_url: row.instagram_url ?? null,
  };
}

function mapUser(row: UserRow): User {
  return {
    ...row,
    must_change_password: boolFromDb(row.must_change_password),
    is_platform_admin: boolFromDb(row.is_platform_admin),
  };
}

function mapStaff(row: StaffRow): StaffAccount {
  return {
    ...row,
    must_change_password: boolFromDb(row.must_change_password),
  };
}

function mapProduct(row: ProductRow): Product {
  return { ...row, active: boolFromDb(row.active) };
}

function mapPublicProduct(row: ProductRow, imageUrls?: string[]): PublicProduct {
  const product = mapProduct(row);
  const { stock_quantity: _stock, ...publicFields } = product;
  const urls =
    imageUrls && imageUrls.length > 0
      ? imageUrls
      : product.image_url
        ? [product.image_url]
        : [];
  return {
    ...publicFields,
    image_url: urls[0] ?? null,
    image_urls: urls,
  };
}

export function insertOtpRequest(
  phone: string,
  expiresAt: string,
  otpHash: string | null = null,
): void {
  getDb()
    .prepare(
      "INSERT INTO otp_requests (id, phone, otp_hash, expires_at) VALUES (?, ?, ?, ?)",
    )
    .run(newId(), phone, otpHash, expiresAt);
}

export function getLatestOtpRequest(
  phone: string,
): { otp_hash: string | null; expires_at: string } | null {
  const row = getDb()
    .prepare(
      `SELECT otp_hash, expires_at FROM otp_requests
       WHERE phone = ? ORDER BY created_at DESC LIMIT 1`,
    )
    .get(phone) as { otp_hash: string | null; expires_at: string } | undefined;
  return row ?? null;
}

export function deleteOtpRequestsForPhone(phone: string): void {
  getDb().prepare("DELETE FROM otp_requests WHERE phone = ?").run(phone);
}

export function categoryBelongsToBusiness(
  categoryId: string,
  businessId: string,
): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS ok FROM categories WHERE id = ? AND business_id = ?")
    .get(categoryId, businessId) as { ok: number } | undefined;
  return row?.ok === 1;
}

export function getUserByPhone(phone: string): User | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE phone = ?")
    .get(phone) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export function getUserById(id: string): User | null {
  const row = getDb()
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(id) as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export function setUserPassword(
  userId: string,
  passwordHash: string,
  mustChange = false,
): void {
  getDb()
    .prepare(
      `UPDATE users
       SET password_hash = ?, password_updated_at = datetime('now'),
           must_change_password = ?, failed_login_attempts = 0, locked_until = NULL
       WHERE id = ?`,
    )
    .run(passwordHash, boolToDb(mustChange), userId);
}

export function recordFailedMerchantLogin(userId: string): void {
  getDb()
    .prepare(
      `UPDATE users
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts + 1 >= 5 THEN datetime('now', '+15 minutes')
             ELSE locked_until
           END
       WHERE id = ?`,
    )
    .run(userId);
}

export function clearMerchantLoginFailures(userId: string): void {
  getDb()
    .prepare(
      "UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?",
    )
    .run(userId);
}

export function setPlatformAdminFlag(userId: string, isAdmin: boolean): void {
  getDb()
    .prepare("UPDATE users SET is_platform_admin = ? WHERE id = ?")
    .run(boolToDb(isAdmin), userId);
}

export function createUser(phone: string): string {
  const id = newId();
  getDb().prepare("INSERT INTO users (id, phone) VALUES (?, ?)").run(id, phone);
  return id;
}

export function ensureUser(phone: string): string {
  const existing = getUserByPhone(phone);
  if (existing) return existing.id;
  return createUser(phone);
}

export function getProfileById(id: string): Profile | null {
  const row = getDb()
    .prepare("SELECT * FROM profiles WHERE id = ?")
    .get(id) as Profile | undefined;
  return row ?? null;
}

export function getProfileByPhone(phone: string): Profile | null {
  const row = getDb()
    .prepare("SELECT * FROM profiles WHERE phone = ?")
    .get(phone) as Profile | undefined;
  return row ?? null;
}

export function ensureProfile(
  userId: string,
  phone: string,
  role: UserRole = "admin",
): void {
  const existing = getProfileById(userId);
  if (!existing) {
    getDb()
      .prepare(
        "INSERT INTO profiles (id, phone, role) VALUES (?, ?, ?)",
      )
      .run(userId, phone, role);
  }
}

export function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, "name" | "role" | "business_id">>,
): void {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.name !== undefined) {
    fields.push("name = ?");
    values.push(data.name);
  }
  if (data.role !== undefined) {
    fields.push("role = ?");
    values.push(data.role);
  }
  if (data.business_id !== undefined) {
    fields.push("business_id = ?");
    values.push(data.business_id);
  }

  if (fields.length === 0) return;

  values.push(userId);
  getDb()
    .prepare(`UPDATE profiles SET ${fields.join(", ")} WHERE id = ?`)
    .run(...values);
}

export function getBusinessById(id: string): Business | null {
  const row = getDb()
    .prepare("SELECT * FROM businesses WHERE id = ?")
    .get(id) as Business | undefined;
  return row ? mapBusiness(row) : null;
}

export function getBusinessBySlug(slug: string): Business | null {
  const row = getDb()
    .prepare("SELECT * FROM businesses WHERE slug = ?")
    .get(slug) as Business | undefined;
  return row ? mapBusiness(row) : null;
}

export function slugExists(slug: string): boolean {
  const row = getDb()
    .prepare("SELECT id FROM businesses WHERE slug = ?")
    .get(slug);
  return !!row;
}

export function createBusiness(data: {
  ownerUserId: string;
  name: string;
  slug: string;
  whatsappNumber: string;
}): Business {
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO businesses (id, owner_user_id, name, slug, whatsapp_number)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, data.ownerUserId, data.name, data.slug, data.whatsappNumber);

  return getBusinessById(id)!;
}

export function updateBusinessCatalogTheme(
  businessId: string,
  theme: CatalogThemeId,
): boolean {
  const result = getDb()
    .prepare("UPDATE businesses SET catalog_theme = ? WHERE id = ?")
    .run(theme, businessId);
  return result.changes > 0;
}

export function updateBusinessById(
  businessId: string,
  data: {
    name: string;
    whatsappNumber: string;
    description: string | null;
    instagramUrl: string | null;
  },
): boolean {
  const runUpdate = () => {
    getDb()
      .prepare(
        `UPDATE businesses
         SET name = ?, whatsapp_number = ?, description = ?, instagram_url = ?
         WHERE id = ?`,
      )
      .run(
        data.name,
        data.whatsappNumber,
        data.description,
        data.instagramUrl,
        businessId,
      );
  };

  try {
    runUpdate();
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("SQLITE_BUSY") || message.includes("database is locked")) {
      runUpdate();
    } else {
      throw err;
    }
  }

  return !!getBusinessById(businessId);
}

export function getCategoryById(
  categoryId: string,
  businessId: string,
): Category | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM categories WHERE id = ? AND business_id = ? LIMIT 1",
    )
    .get(categoryId, businessId) as Category | undefined;
  return row ?? null;
}

export function countCategories(businessId: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM categories WHERE business_id = ?")
    .get(businessId) as { count: number };
  return row.count;
}

export function listCategories(businessId: string): Category[] {
  return getDb()
    .prepare(
      "SELECT * FROM categories WHERE business_id = ? ORDER BY name ASC",
    )
    .all(businessId) as Category[];
}

export function insertCategory(data: {
  businessId: string;
  name: string;
  description: string | null;
}): void {
  getDb()
    .prepare(
      "INSERT INTO categories (id, business_id, name, description) VALUES (?, ?, ?, ?)",
    )
    .run(newId(), data.businessId, data.name, data.description);
}

export function deleteCategoryById(
  categoryId: string,
  businessId: string,
): boolean {
  const result = getDb()
    .prepare("DELETE FROM categories WHERE id = ? AND business_id = ?")
    .run(categoryId, businessId);
  return result.changes > 0;
}

export function countProducts(businessId: string): number {
  const row = getDb()
    .prepare("SELECT COUNT(*) as count FROM products WHERE business_id = ?")
    .get(businessId) as { count: number };
  return row.count;
}

export function listProducts(businessId: string): Product[] {
  const rows = getDb()
    .prepare(
      "SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC",
    )
    .all(businessId) as ProductRow[];
  return rows.map(mapProduct);
}

export function listProductsWithCategory(
  businessId: string,
): Array<Product & { categories: { name: string } | null }> {
  const rows = getDb()
    .prepare(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.business_id = ?
       ORDER BY p.created_at DESC`,
    )
    .all(businessId) as Array<ProductRow & { category_name: string | null }>;

  return rows.map((row) => ({
    ...mapProduct(row),
    categories: row.category_name ? { name: row.category_name } : null,
  }));
}

export function getProductById(
  productId: string,
  businessId: string,
): Product | null {
  const row = getDb()
    .prepare("SELECT * FROM products WHERE id = ? AND business_id = ?")
    .get(productId, businessId) as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export function insertProduct(data: {
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  priceText: string;
  imageUrls: string[];
  active: boolean;
}): string {
  const productId = newId();
  const primaryImage = data.imageUrls[0] ?? null;
  getDb()
    .prepare(
      `INSERT INTO products
       (id, business_id, category_id, name, description, image_url, price_text, stock_quantity, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    )
    .run(
      productId,
      data.businessId,
      data.categoryId,
      data.name,
      data.description,
      primaryImage,
      data.priceText,
      data.active ? 1 : 0,
    );
  setProductImageUrls(productId, data.businessId, data.imageUrls);
  return productId;
}

export function updateProductById(
  productId: string,
  businessId: string,
  data: {
    name: string;
    description: string | null;
    priceText: string;
    categoryId: string | null;
    imageUrls: string[];
    active: boolean;
  },
): boolean {
  const primaryImage = data.imageUrls[0] ?? null;
  const result = getDb()
    .prepare(
      `UPDATE products
       SET name = ?, description = ?, price_text = ?, category_id = ?, image_url = ?, active = ?, updated_at = datetime('now')
       WHERE id = ? AND business_id = ?`,
    )
    .run(
      data.name,
      data.description,
      data.priceText,
      data.categoryId,
      primaryImage,
      data.active ? 1 : 0,
      productId,
      businessId,
    );
  if (result.changes === 0) return false;
  setProductImageUrls(productId, businessId, data.imageUrls);
  return true;
}

export function deleteProductById(
  productId: string,
  businessId: string,
): boolean {
  const result = getDb()
    .prepare("DELETE FROM products WHERE id = ? AND business_id = ?")
    .run(productId, businessId);
  return result.changes > 0;
}

export function listProductImageUrls(productId: string): string[] {
  const rows = getDb()
    .prepare(
      `SELECT image_url FROM product_images
       WHERE product_id = ? ORDER BY sort_order ASC, created_at ASC`,
    )
    .all(productId) as { image_url: string }[];
  return rows.map((row) => row.image_url);
}

export function setProductImageUrls(
  productId: string,
  businessId: string,
  imageUrls: string[],
): boolean {
  const db = getDb();
  const owned = db
    .prepare(`SELECT id FROM products WHERE id = ? AND business_id = ?`)
    .get(productId, businessId) as { id: string } | undefined;
  if (!owned) return false;

  const primaryImage = imageUrls[0] ?? null;
  const sync = db.transaction(() => {
    db.prepare(`DELETE FROM product_images WHERE product_id = ?`).run(productId);
    const insert = db.prepare(
      `INSERT INTO product_images (id, product_id, image_url, sort_order) VALUES (?, ?, ?, ?)`,
    );
    imageUrls.forEach((url, index) => {
      insert.run(newId(), productId, url, index);
    });
    db.prepare(
      `UPDATE products SET image_url = ?, updated_at = datetime('now') WHERE id = ? AND business_id = ?`,
    ).run(primaryImage, productId, businessId);
  });
  sync();
  return true;
}

export function listPublicProducts(businessId: string): PublicProduct[] {
  const rows = getDb()
    .prepare(
      `SELECT id, business_id, category_id, name, description, image_url, price_text, active, created_at, updated_at
       FROM products WHERE business_id = ? AND active = 1 ORDER BY name ASC`,
    )
    .all(businessId) as ProductRow[];
  return rows.map((row) => mapPublicProduct(row));
}

export function getPublicProduct(
  productId: string,
  businessId: string,
): PublicProduct | null {
  const row = getDb()
    .prepare(
      `SELECT id, business_id, category_id, name, description, image_url, price_text, active, created_at, updated_at
       FROM products WHERE id = ? AND business_id = ? AND active = 1`,
    )
    .get(productId, businessId) as ProductRow | undefined;
  if (!row) return null;
  return mapPublicProduct(row, listProductImageUrls(productId));
}

export function updateProductStock(
  productId: string,
  businessId: string,
  newStock: number,
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE products SET stock_quantity = ?, updated_at = datetime('now')
       WHERE id = ? AND business_id = ?`,
    )
    .run(newStock, productId, businessId);
  return result.changes > 0;
}

export function insertInventoryLog(data: {
  productId: string;
  userId?: string | null;
  staffAccountId?: string | null;
  changeAmount: number;
  actionType: string;
}): void {
  getDb()
    .prepare(
      `INSERT INTO inventory_logs (id, product_id, user_id, staff_account_id, change_amount, action_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      newId(),
      data.productId,
      data.userId ?? null,
      data.staffAccountId ?? null,
      data.changeAmount,
      data.actionType,
    );
}

export function countDailyActivity(businessId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as count
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       WHERE p.business_id = ?
         AND il.timestamp >= datetime('now', 'start of day')
         AND il.timestamp < datetime('now', 'start of day', '+1 day')`,
    )
    .get(businessId) as { count: number };
  return row.count;
}

export function countStaff(businessId: string): number {
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) as count FROM staff_accounts
       WHERE business_id = ? AND status = 'active'`,
    )
    .get(businessId) as { count: number };
  return row.count;
}

export function listStaff(businessId: string): StaffAccount[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM staff_accounts
       WHERE business_id = ? AND status != 'deleted'
       ORDER BY created_at ASC`,
    )
    .all(businessId) as StaffRow[];
  return rows.map(mapStaff);
}

export function getStaffByUsername(username: string): StaffAccount | null {
  const row = getDb()
    .prepare("SELECT * FROM staff_accounts WHERE username = ? COLLATE NOCASE")
    .get(username.trim()) as StaffRow | undefined;
  return row ? mapStaff(row) : null;
}

export function getStaffById(id: string): StaffAccount | null {
  const row = getDb()
    .prepare("SELECT * FROM staff_accounts WHERE id = ?")
    .get(id) as StaffRow | undefined;
  return row ? mapStaff(row) : null;
}

export function createStaffAccount(data: {
  businessId: string;
  name: string;
  contactPhone: string;
  username: string;
  passwordHash: string;
}): StaffAccount {
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO staff_accounts
       (id, business_id, name, contact_phone, username, password_hash, status, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, 'active', 1)`,
    )
    .run(
      id,
      data.businessId,
      data.name,
      data.contactPhone,
      data.username,
      data.passwordHash,
    );
  return getStaffById(id)!;
}

export function updateStaffStatus(
  staffId: string,
  businessId: string,
  status: StaffStatus,
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE staff_accounts
       SET status = ?, deactivated_at = CASE WHEN ? = 'active' THEN NULL ELSE datetime('now') END
       WHERE id = ? AND business_id = ? AND status != 'deleted'`,
    )
    .run(status, status, staffId, businessId);
  return result.changes > 0;
}

export function deleteStaffAccount(staffId: string, businessId: string): boolean {
  const result = getDb()
    .prepare(
      `UPDATE staff_accounts
       SET status = 'deleted', deactivated_at = datetime('now')
       WHERE id = ? AND business_id = ?`,
    )
    .run(staffId, businessId);
  return result.changes > 0;
}

export function resetStaffPassword(
  staffId: string,
  businessId: string,
  passwordHash: string,
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE staff_accounts
       SET password_hash = ?, must_change_password = 1,
           failed_login_attempts = 0, locked_until = NULL
       WHERE id = ? AND business_id = ? AND status != 'deleted'`,
    )
    .run(passwordHash, staffId, businessId);
  return result.changes > 0;
}

export function recordFailedStaffLogin(staffId: string): void {
  getDb()
    .prepare(
      `UPDATE staff_accounts
       SET failed_login_attempts = failed_login_attempts + 1,
           locked_until = CASE
             WHEN failed_login_attempts + 1 >= 5 THEN datetime('now', '+15 minutes')
             ELSE locked_until
           END
       WHERE id = ?`,
    )
    .run(staffId);
}

export function clearStaffLoginFailures(staffId: string): void {
  getDb()
    .prepare(
      "UPDATE staff_accounts SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?",
    )
    .run(staffId);
}

export function updateBusinessPlan(
  businessId: string,
  plan: "free" | "paid",
  planStatus: "active" | "past_due" | "cancelled" = "active",
): void {
  getDb()
    .prepare(
      "UPDATE businesses SET plan = ?, plan_status = ? WHERE id = ?",
    )
    .run(plan, planStatus, businessId);
}

export function insertSubscription(data: {
  businessId: string;
  userPhone: string;
  razorpayOrderId?: string | null;
  amountPaise: number;
  status?: string;
}): Subscription {
  const id = newId();
  getDb()
    .prepare(
      `INSERT INTO subscriptions
       (id, business_id, user_phone, razorpay_order_id, plan, status, amount_paise)
       VALUES (?, ?, ?, ?, 'paid', ?, ?)`,
    )
    .run(
      id,
      data.businessId,
      data.userPhone,
      data.razorpayOrderId ?? null,
      data.status ?? "pending",
      data.amountPaise,
    );
  return getDb()
    .prepare("SELECT * FROM subscriptions WHERE id = ?")
    .get(id) as Subscription;
}

export function completeSubscription(
  orderId: string,
  paymentId: string,
): Subscription | null {
  const sub = getDb()
    .prepare("SELECT * FROM subscriptions WHERE razorpay_order_id = ?")
    .get(orderId) as Subscription | undefined;
  if (!sub) return null;

  getDb()
    .prepare(
      `UPDATE subscriptions
       SET status = 'paid', razorpay_payment_id = ?,
           current_period_start = datetime('now'),
           current_period_end = datetime('now', '+30 days')
       WHERE id = ?`,
    )
    .run(paymentId, sub.id);

  updateBusinessPlan(sub.business_id, "paid", "active");
  return getDb()
    .prepare("SELECT * FROM subscriptions WHERE id = ?")
    .get(sub.id) as Subscription;
}

export function listPlatformBusinesses(limit = 50): Array<
  Business & { owner_phone: string }
> {
  const rows = getDb()
    .prepare(
      `SELECT b.*, u.phone AS owner_phone
       FROM businesses b
       JOIN users u ON u.id = b.owner_user_id
       ORDER BY b.created_at DESC
       LIMIT ?`,
    )
    .all(limit) as Array<Business & { owner_phone: string }>;
  return rows.map((row) => ({
    ...mapBusiness(row),
    owner_phone: row.owner_phone,
  }));
}

export function getPlatformStats(): {
  totalBusinesses: number;
  freeBusinesses: number;
  paidBusinesses: number;
  totalRevenuePaise: number;
} {
  const totals = getDb()
    .prepare(
      `SELECT
         COUNT(*) AS totalBusinesses,
         SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END) AS freeBusinesses,
         SUM(CASE WHEN plan = 'paid' THEN 1 ELSE 0 END) AS paidBusinesses
       FROM businesses`,
    )
    .get() as {
    totalBusinesses: number;
    freeBusinesses: number;
    paidBusinesses: number;
  };

  const revenue = getDb()
    .prepare(
      `SELECT COALESCE(SUM(amount_paise), 0) AS total
       FROM subscriptions WHERE status = 'paid'`,
    )
    .get() as { total: number };

  return {
    totalBusinesses: totals.totalBusinesses,
    freeBusinesses: totals.freeBusinesses,
    paidBusinesses: totals.paidBusinesses,
    totalRevenuePaise: revenue.total,
  };
}

export function listLowStockProducts(
  businessId: string,
  threshold: number,
  limit: number,
): Array<{ id: string; name: string; stock_quantity: number }> {
  return getDb()
    .prepare(
      `SELECT id, name, stock_quantity FROM products
       WHERE business_id = ? AND stock_quantity <= ?
       ORDER BY stock_quantity ASC LIMIT ?`,
    )
    .all(businessId, threshold, limit) as Array<{
    id: string;
    name: string;
    stock_quantity: number;
  }>;
}

export function listRecentActivity(
  businessId: string,
  limit: number,
): Array<{
  id: string;
  change_amount: number;
  action_type: string;
  timestamp: string;
  products: { name: string };
}> {
  const rows = getDb()
    .prepare(
      `SELECT il.id, il.change_amount, il.action_type, il.timestamp, p.name AS product_name
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       WHERE p.business_id = ?
       ORDER BY il.timestamp DESC
       LIMIT ?`,
    )
    .all(businessId, limit) as Array<{
    id: string;
    change_amount: number;
    action_type: string;
    timestamp: string;
    product_name: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    change_amount: row.change_amount,
    action_type: row.action_type,
    timestamp: row.timestamp,
    products: { name: row.product_name },
  }));
}

export function getDashboardSnapshot(
  businessId: string,
  lowStockThreshold: number,
  lowStockLimit: number,
  activityLimit: number,
): import("./dashboard-types").DashboardSnapshot {
  const db = getDb();
  const counts = db
    .prepare(
      `SELECT
        (SELECT COUNT(*) FROM products WHERE business_id = ?) AS products_count,
        (SELECT COUNT(*) FROM categories WHERE business_id = ?) AS categories_count,
        (SELECT COUNT(*) FROM staff_accounts WHERE business_id = ? AND status = 'active') AS staff_count,
        (SELECT COUNT(*) FROM inventory_logs il
          JOIN products p ON p.id = il.product_id
          WHERE p.business_id = ?
            AND il.timestamp >= datetime('now', 'start of day')
            AND il.timestamp < datetime('now', 'start of day', '+1 day')) AS activity_today`,
    )
    .get(businessId, businessId, businessId, businessId) as {
    products_count: number;
    categories_count: number;
    staff_count: number;
    activity_today: number;
  };

  return {
    productsCount: counts.products_count,
    categoriesCount: counts.categories_count,
    staffCount: counts.staff_count,
    activityToday: counts.activity_today,
    lowStock: listLowStockProducts(businessId, lowStockThreshold, lowStockLimit),
    recentActivity: listRecentActivity(businessId, activityLimit),
  };
}

export function getCatalogPageBySlug(slug: string): {
  business: Business;
  products: PublicProduct[];
  categories: Category[];
} | null {
  const business = getBusinessBySlug(slug);
  if (!business) return null;
  return {
    business,
    products: listPublicProducts(business.id),
    categories: listCategories(business.id),
  };
}

export function getPublicProductPageBySlug(
  slug: string,
  productId: string,
): {
  business: Business;
  product: PublicProduct;
  category: Category | null;
} | null {
  const business = getBusinessBySlug(slug);
  if (!business) return null;

  const product = getPublicProduct(productId, business.id);
  if (!product) return null;

  const category = product.category_id
    ? getCategoryById(product.category_id, business.id)
    : null;

  return { business, product, category };
}

export function listActivityLogs(
  businessId: string,
  limit: number,
): Array<
  InventoryLog & {
    products: { name: string };
    profiles: { name: string | null; phone: string };
  }
> {
  const rows = getDb()
    .prepare(
      `SELECT il.*, p.name AS product_name,
              COALESCE(pr.name, sa.name, 'User') AS actor_name
       FROM inventory_logs il
       JOIN products p ON p.id = il.product_id
       LEFT JOIN profiles pr ON pr.id = il.user_id
       LEFT JOIN staff_accounts sa ON sa.id = il.staff_account_id
       WHERE p.business_id = ?
       ORDER BY il.timestamp DESC
       LIMIT ?`,
    )
    .all(businessId, limit) as Array<
    InventoryLog & {
      product_name: string;
      actor_name: string;
    }
  >;

  return rows.map((row) => ({
    id: row.id,
    product_id: row.product_id,
    user_id: row.user_id,
    staff_account_id: row.staff_account_id,
    change_amount: row.change_amount,
    action_type: row.action_type,
    timestamp: row.timestamp,
    products: { name: row.product_name },
    profiles: { name: row.actor_name, phone: "" },
  }));
}

export function getProductStock(
  productId: string,
  businessId: string,
): { id: string; stock_quantity: number } | null {
  const row = getDb()
    .prepare(
      "SELECT id, stock_quantity FROM products WHERE id = ? AND business_id = ?",
    )
    .get(productId, businessId) as
    | { id: string; stock_quantity: number }
    | undefined;
  return row ?? null;
}

export function listInventoryProducts(
  businessId: string,
): Array<{ id: string; name: string; stock_quantity: number; updated_at: string }> {
  return getDb()
    .prepare(
      "SELECT id, name, stock_quantity, updated_at FROM products WHERE business_id = ? ORDER BY name ASC",
    )
    .all(businessId) as Array<{
    id: string;
    name: string;
    stock_quantity: number;
    updated_at: string;
  }>;
}
