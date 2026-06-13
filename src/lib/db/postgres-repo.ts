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
import { getPostgres, newId } from "./postgres-connection";
import { resolveCatalogTheme } from "@/lib/catalog-themes";
import { resolveBusinessPlan } from "@/lib/plans";

function boolFromDb(value: number | boolean): boolean {
  return value === true || value === 1;
}

function castRows<T>(rows: unknown): T {
  return rows as T;
}

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

function mapPublicProduct(row: ProductRow): PublicProduct {
  const product = mapProduct(row);
  const { stock_quantity: _stock, ...publicProduct } = product;
  return publicProduct;
}

export async function insertOtpRequest(
  phone: string,
  expiresAt: string,
  otpHash: string | null = null,
): Promise<void> {
  const sql = getPostgres();
  await sql`
    INSERT INTO otp_requests (id, phone, otp_hash, expires_at)
    VALUES (${newId()}, ${phone}, ${otpHash}, ${expiresAt})
  `;
}

export async function getLatestOtpRequest(
  phone: string,
): Promise<{ otp_hash: string | null; expires_at: string } | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT otp_hash, expires_at FROM otp_requests
    WHERE phone = ${phone} ORDER BY created_at DESC LIMIT 1
  `;
  return (rows[0] as { otp_hash: string | null; expires_at: string } | undefined) ?? null;
}

export async function deleteOtpRequestsForPhone(phone: string): Promise<void> {
  const sql = getPostgres();
  await sql`DELETE FROM otp_requests WHERE phone = ${phone}`;
}

export async function categoryBelongsToBusiness(
  categoryId: string,
  businessId: string,
): Promise<boolean> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT 1 AS ok FROM categories WHERE id = ${categoryId} AND business_id = ${businessId}
  `;
  return rows.length > 0;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM users WHERE phone = ${phone}`;
  const row = rows[0] as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM users WHERE id = ${id}`;
  const row = rows[0] as UserRow | undefined;
  return row ? mapUser(row) : null;
}

export async function setUserPassword(
  userId: string,
  passwordHash: string,
  mustChange = false,
): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE users
    SET password_hash = ${passwordHash},
        password_updated_at = now(),
        must_change_password = ${mustChange},
        failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = ${userId}
  `;
}

export async function recordFailedMerchantLogin(userId: string): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE users
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE
          WHEN failed_login_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE locked_until
        END
    WHERE id = ${userId}
  `;
}

export async function clearMerchantLoginFailures(userId: string): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${userId}
  `;
}

export async function setPlatformAdminFlag(
  userId: string,
  isAdmin: boolean,
): Promise<void> {
  const sql = getPostgres();
  await sql`UPDATE users SET is_platform_admin = ${isAdmin} WHERE id = ${userId}`;
}

export async function createUser(phone: string): Promise<string> {
  const sql = getPostgres();
  const id = newId();
  await sql`INSERT INTO users (id, phone) VALUES (${id}, ${phone})`;
  return id;
}

export async function ensureUser(phone: string): Promise<string> {
  const existing = await getUserByPhone(phone);
  if (existing) return existing.id;
  return createUser(phone);
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM profiles WHERE id = ${id}`;
  return (rows[0] as Profile | undefined) ?? null;
}

export async function getProfileByPhone(phone: string): Promise<Profile | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM profiles WHERE phone = ${phone}`;
  return (rows[0] as Profile | undefined) ?? null;
}

export async function ensureProfile(
  userId: string,
  phone: string,
  role: UserRole = "admin",
): Promise<void> {
  const existing = await getProfileById(userId);
  if (!existing) {
    const sql = getPostgres();
    await sql`
      INSERT INTO profiles (id, phone, role) VALUES (${userId}, ${phone}, ${role})
    `;
  }
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<Profile, "name" | "role" | "business_id">>,
): Promise<void> {
  const sql = getPostgres();

  if (data.name !== undefined) {
    await sql`UPDATE profiles SET name = ${data.name} WHERE id = ${userId}`;
  }
  if (data.role !== undefined) {
    await sql`UPDATE profiles SET role = ${data.role} WHERE id = ${userId}`;
  }
  if (data.business_id !== undefined) {
    await sql`UPDATE profiles SET business_id = ${data.business_id} WHERE id = ${userId}`;
  }
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM businesses WHERE id = ${id}`;
  const row = rows[0] as Business | undefined;
  return row ? mapBusiness(row) : null;
}

export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM businesses WHERE slug = ${slug}`;
  const row = rows[0] as Business | undefined;
  return row ? mapBusiness(row) : null;
}

export async function slugExists(slug: string): Promise<boolean> {
  const sql = getPostgres();
  const rows = await sql`SELECT id FROM businesses WHERE slug = ${slug}`;
  return rows.length > 0;
}

export async function createBusiness(data: {
  ownerUserId: string;
  name: string;
  slug: string;
  whatsappNumber: string;
}): Promise<Business> {
  const sql = getPostgres();
  const id = newId();
  await sql`
    INSERT INTO businesses (id, owner_user_id, name, slug, whatsapp_number)
    VALUES (${id}, ${data.ownerUserId}, ${data.name}, ${data.slug}, ${data.whatsappNumber})
  `;
  return (await getBusinessById(id))!;
}

export async function updateBusinessCatalogTheme(
  businessId: string,
  theme: CatalogThemeId,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE businesses SET catalog_theme = ${theme} WHERE id = ${businessId}
  `;
  return result.count > 0;
}

export async function updateBusinessById(
  businessId: string,
  data: {
    name: string;
    whatsappNumber: string;
    description: string | null;
    instagramUrl: string | null;
  },
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE businesses
    SET name = ${data.name},
        whatsapp_number = ${data.whatsappNumber},
        description = ${data.description},
        instagram_url = ${data.instagramUrl}
    WHERE id = ${businessId}
  `;
  return result.count > 0;
}

export async function getCategoryById(
  categoryId: string,
  businessId: string,
): Promise<Category | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT * FROM categories
    WHERE id = ${categoryId} AND business_id = ${businessId}
    LIMIT 1
  `;
  const row = rows[0] as Category | undefined;
  return row ?? null;
}

export async function countCategories(businessId: string): Promise<number> {
  const sql = getPostgres();
  const [row] = await sql`
    SELECT COUNT(*)::int AS count FROM categories WHERE business_id = ${businessId}
  `;
  return row.count as number;
}

export async function listCategories(businessId: string): Promise<Category[]> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT * FROM categories WHERE business_id = ${businessId} ORDER BY name ASC
  `;
  return castRows<Category[]>(rows);
}

export async function insertCategory(data: {
  businessId: string;
  name: string;
  description: string | null;
}): Promise<void> {
  const sql = getPostgres();
  await sql`
    INSERT INTO categories (id, business_id, name, description)
    VALUES (${newId()}, ${data.businessId}, ${data.name}, ${data.description})
  `;
}

export async function deleteCategoryById(
  categoryId: string,
  businessId: string,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    DELETE FROM categories WHERE id = ${categoryId} AND business_id = ${businessId}
  `;
  return result.count > 0;
}

export async function countProducts(businessId: string): Promise<number> {
  const sql = getPostgres();
  const [row] = await sql`
    SELECT COUNT(*)::int AS count FROM products WHERE business_id = ${businessId}
  `;
  return row.count as number;
}

export async function listProducts(businessId: string): Promise<Product[]> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT * FROM products WHERE business_id = ${businessId} ORDER BY created_at DESC
  `;
  return castRows<ProductRow[]>(rows).map(mapProduct);
}

export async function listProductsWithCategory(
  businessId: string,
): Promise<Array<Product & { categories: { name: string } | null }>> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.business_id = ${businessId}
    ORDER BY p.created_at DESC
  `;

  return castRows<Array<ProductRow & { category_name: string | null }>>(rows).map(
    (row) => ({
      ...mapProduct(row),
      categories: row.category_name ? { name: row.category_name } : null,
    }),
  );
}

export async function getProductById(
  productId: string,
  businessId: string,
): Promise<Product | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT * FROM products WHERE id = ${productId} AND business_id = ${businessId}
  `;
  const row = rows[0] as ProductRow | undefined;
  return row ? mapProduct(row) : null;
}

export async function insertProduct(data: {
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  priceText: string;
  imageUrl: string | null;
  active: boolean;
}): Promise<void> {
  const sql = getPostgres();
  await sql`
    INSERT INTO products
      (id, business_id, category_id, name, description, image_url, price_text, stock_quantity, active)
    VALUES (${newId()}, ${data.businessId}, ${data.categoryId}, ${data.name}, ${data.description}, ${data.imageUrl}, ${data.priceText}, 0, ${data.active})
  `;
}

export async function updateProductById(
  productId: string,
  businessId: string,
  data: {
    name: string;
    description: string | null;
    priceText: string;
    categoryId: string | null;
    imageUrl: string | null;
    active: boolean;
  },
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE products
    SET name = ${data.name},
        description = ${data.description},
        price_text = ${data.priceText},
        category_id = ${data.categoryId},
        image_url = ${data.imageUrl},
        active = ${data.active},
        updated_at = now()
    WHERE id = ${productId} AND business_id = ${businessId}
  `;
  return result.count > 0;
}

export async function deleteProductById(
  productId: string,
  businessId: string,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    DELETE FROM products WHERE id = ${productId} AND business_id = ${businessId}
  `;
  return result.count > 0;
}

export async function listPublicProducts(businessId: string): Promise<PublicProduct[]> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT id, business_id, category_id, name, description, image_url, price_text, active, created_at, updated_at
    FROM products WHERE business_id = ${businessId} AND active = true ORDER BY name ASC
  `;
  return castRows<ProductRow[]>(rows).map(mapPublicProduct);
}

export async function getPublicProduct(
  productId: string,
  businessId: string,
): Promise<PublicProduct | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT id, business_id, category_id, name, description, image_url, price_text, active, created_at, updated_at
    FROM products WHERE id = ${productId} AND business_id = ${businessId} AND active = true
  `;
  const row = rows[0] as ProductRow | undefined;
  return row ? mapPublicProduct(row) : null;
}

export async function updateProductStock(
  productId: string,
  businessId: string,
  newStock: number,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE products SET stock_quantity = ${newStock}, updated_at = now()
    WHERE id = ${productId} AND business_id = ${businessId}
  `;
  return result.count > 0;
}

export async function insertInventoryLog(data: {
  productId: string;
  userId?: string | null;
  staffAccountId?: string | null;
  changeAmount: number;
  actionType: string;
}): Promise<void> {
  const sql = getPostgres();
  await sql`
    INSERT INTO inventory_logs (id, product_id, user_id, staff_account_id, change_amount, action_type)
    VALUES (${newId()}, ${data.productId}, ${data.userId ?? null}, ${data.staffAccountId ?? null}, ${data.changeAmount}, ${data.actionType})
  `;
}

export async function countDailyActivity(businessId: string): Promise<number> {
  const sql = getPostgres();
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM inventory_logs il
    JOIN products p ON p.id = il.product_id
    WHERE p.business_id = ${businessId}
      AND il.timestamp >= date_trunc('day', now())
      AND il.timestamp < date_trunc('day', now()) + interval '1 day'
  `;
  return row.count as number;
}

export async function countStaff(businessId: string): Promise<number> {
  const sql = getPostgres();
  const [row] = await sql`
    SELECT COUNT(*)::int AS count FROM staff_accounts
    WHERE business_id = ${businessId} AND status = 'active'
  `;
  return row.count as number;
}

export async function listStaff(businessId: string): Promise<StaffAccount[]> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT * FROM staff_accounts
    WHERE business_id = ${businessId} AND status != 'deleted'
    ORDER BY created_at ASC
  `;
  return castRows<StaffRow[]>(rows).map(mapStaff);
}

export async function getStaffByUsername(username: string): Promise<StaffAccount | null> {
  const sql = getPostgres();
  const trimmed = username.trim();
  const rows = await sql`
    SELECT * FROM staff_accounts WHERE lower(username) = lower(${trimmed})
  `;
  const row = rows[0] as StaffRow | undefined;
  return row ? mapStaff(row) : null;
}

export async function getStaffById(id: string): Promise<StaffAccount | null> {
  const sql = getPostgres();
  const rows = await sql`SELECT * FROM staff_accounts WHERE id = ${id}`;
  const row = rows[0] as StaffRow | undefined;
  return row ? mapStaff(row) : null;
}

export async function createStaffAccount(data: {
  businessId: string;
  name: string;
  contactPhone: string;
  username: string;
  passwordHash: string;
}): Promise<StaffAccount> {
  const sql = getPostgres();
  const id = newId();
  await sql`
    INSERT INTO staff_accounts
      (id, business_id, name, contact_phone, username, password_hash, status, must_change_password)
    VALUES (${id}, ${data.businessId}, ${data.name}, ${data.contactPhone}, ${data.username}, ${data.passwordHash}, 'active', true)
  `;
  return (await getStaffById(id))!;
}

export async function updateStaffStatus(
  staffId: string,
  businessId: string,
  status: StaffStatus,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE staff_accounts
    SET status = ${status},
        deactivated_at = CASE WHEN ${status} = 'active' THEN NULL ELSE now() END
    WHERE id = ${staffId} AND business_id = ${businessId} AND status != 'deleted'
  `;
  return result.count > 0;
}

export async function deleteStaffAccount(
  staffId: string,
  businessId: string,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE staff_accounts
    SET status = 'deleted', deactivated_at = now()
    WHERE id = ${staffId} AND business_id = ${businessId}
  `;
  return result.count > 0;
}

export async function resetStaffPassword(
  staffId: string,
  businessId: string,
  passwordHash: string,
): Promise<boolean> {
  const sql = getPostgres();
  const result = await sql`
    UPDATE staff_accounts
    SET password_hash = ${passwordHash},
        must_change_password = true,
        failed_login_attempts = 0,
        locked_until = NULL
    WHERE id = ${staffId} AND business_id = ${businessId} AND status != 'deleted'
  `;
  return result.count > 0;
}

export async function recordFailedStaffLogin(staffId: string): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE staff_accounts
    SET failed_login_attempts = failed_login_attempts + 1,
        locked_until = CASE
          WHEN failed_login_attempts + 1 >= 5 THEN now() + interval '15 minutes'
          ELSE locked_until
        END
    WHERE id = ${staffId}
  `;
}

export async function clearStaffLoginFailures(staffId: string): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE staff_accounts SET failed_login_attempts = 0, locked_until = NULL WHERE id = ${staffId}
  `;
}

export async function updateBusinessPlan(
  businessId: string,
  plan: "free" | "paid",
  planStatus: "active" | "past_due" | "cancelled" = "active",
): Promise<void> {
  const sql = getPostgres();
  await sql`
    UPDATE businesses SET plan = ${plan}, plan_status = ${planStatus} WHERE id = ${businessId}
  `;
}

export async function insertSubscription(data: {
  businessId: string;
  userPhone: string;
  razorpayOrderId?: string | null;
  amountPaise: number;
  status?: string;
}): Promise<Subscription> {
  const sql = getPostgres();
  const id = newId();
  await sql`
    INSERT INTO subscriptions
      (id, business_id, user_phone, razorpay_order_id, plan, status, amount_paise)
    VALUES (${id}, ${data.businessId}, ${data.userPhone}, ${data.razorpayOrderId ?? null}, 'paid', ${data.status ?? "pending"}, ${data.amountPaise})
  `;
  const rows = await sql`SELECT * FROM subscriptions WHERE id = ${id}`;
  return rows[0] as Subscription;
}

export async function completeSubscription(
  orderId: string,
  paymentId: string,
): Promise<Subscription | null> {
  const sql = getPostgres();
  const subRows = await sql`
    SELECT * FROM subscriptions WHERE razorpay_order_id = ${orderId}
  `;
  const sub = subRows[0] as Subscription | undefined;
  if (!sub) return null;

  await sql`
    UPDATE subscriptions
    SET status = 'paid',
        razorpay_payment_id = ${paymentId},
        current_period_start = now(),
        current_period_end = now() + interval '30 days'
    WHERE id = ${sub.id}
  `;

  await updateBusinessPlan(sub.business_id, "paid", "active");
  const rows = await sql`SELECT * FROM subscriptions WHERE id = ${sub.id}`;
  return rows[0] as Subscription;
}

export async function listPlatformBusinesses(limit = 50): Promise<
  Array<Business & { owner_phone: string }>
> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT b.*, u.phone AS owner_phone
    FROM businesses b
    JOIN users u ON u.id = b.owner_user_id
    ORDER BY b.created_at DESC
    LIMIT ${limit}
  `;
  return castRows<Array<Business & { owner_phone: string }>>(rows).map((row) => ({
    ...mapBusiness(row),
    owner_phone: row.owner_phone,
  }));
}

export async function getPlatformStats(): Promise<{
  totalBusinesses: number;
  freeBusinesses: number;
  paidBusinesses: number;
  totalRevenuePaise: number;
}> {
  const sql = getPostgres();
  const [totals] = await sql`
    SELECT
      COUNT(*)::int AS "totalBusinesses",
      SUM(CASE WHEN plan = 'free' THEN 1 ELSE 0 END)::int AS "freeBusinesses",
      SUM(CASE WHEN plan = 'paid' THEN 1 ELSE 0 END)::int AS "paidBusinesses"
    FROM businesses
  `;

  const [revenue] = await sql`
    SELECT COALESCE(SUM(amount_paise), 0)::int AS total
    FROM subscriptions WHERE status = 'paid'
  `;

  return {
    totalBusinesses: totals.totalBusinesses as number,
    freeBusinesses: totals.freeBusinesses as number,
    paidBusinesses: totals.paidBusinesses as number,
    totalRevenuePaise: revenue.total as number,
  };
}

export async function listLowStockProducts(
  businessId: string,
  threshold: number,
  limit: number,
): Promise<Array<{ id: string; name: string; stock_quantity: number }>> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT id, name, stock_quantity FROM products
    WHERE business_id = ${businessId} AND stock_quantity <= ${threshold}
    ORDER BY stock_quantity ASC LIMIT ${limit}
  `;
  return castRows<Array<{ id: string; name: string; stock_quantity: number }>>(rows);
}

export async function listRecentActivity(
  businessId: string,
  limit: number,
): Promise<
  Array<{
    id: string;
    change_amount: number;
    action_type: string;
    timestamp: string;
    products: { name: string };
  }>
> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT il.id, il.change_amount, il.action_type, il.timestamp, p.name AS product_name
    FROM inventory_logs il
    JOIN products p ON p.id = il.product_id
    WHERE p.business_id = ${businessId}
    ORDER BY il.timestamp DESC
    LIMIT ${limit}
  `;

  return castRows<
    Array<{
      id: string;
      change_amount: number;
      action_type: string;
      timestamp: string;
      product_name: string;
    }>
  >(rows).map((row) => ({
    id: row.id,
    change_amount: row.change_amount,
    action_type: row.action_type,
    timestamp: row.timestamp,
    products: { name: row.product_name },
  }));
}

type LowStockRow = { id: string; name: string; stock_quantity: number };

type RecentActivityRow = {
  id: string;
  change_amount: number;
  action_type: string;
  timestamp: string;
  product_name: string;
};

function parseLowStockJson(value: unknown): LowStockRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is LowStockRow =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as LowStockRow).id === "string" &&
      typeof (item as LowStockRow).name === "string" &&
      typeof (item as LowStockRow).stock_quantity === "number",
  );
}

function parseRecentActivityJson(value: unknown): Array<{
  id: string;
  change_amount: number;
  action_type: string;
  timestamp: string;
  products: { name: string };
}> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is RecentActivityRow =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as RecentActivityRow).id === "string",
    )
    .map((row) => ({
      id: row.id,
      change_amount: row.change_amount,
      action_type: row.action_type,
      timestamp: row.timestamp,
      products: { name: row.product_name },
    }));
}

export async function getDashboardSnapshot(
  businessId: string,
  lowStockThreshold: number,
  lowStockLimit: number,
  activityLimit: number,
): Promise<import("./dashboard-types").DashboardSnapshot> {
  const sql = getPostgres();
  const [row] = await sql`
    SELECT
      (SELECT COUNT(*)::int FROM products WHERE business_id = ${businessId}) AS products_count,
      (SELECT COUNT(*)::int FROM categories WHERE business_id = ${businessId}) AS categories_count,
      (SELECT COUNT(*)::int FROM staff_accounts WHERE business_id = ${businessId} AND status = 'active') AS staff_count,
      (SELECT COUNT(*)::int FROM inventory_logs il
        JOIN products p ON p.id = il.product_id
        WHERE p.business_id = ${businessId}
          AND il.timestamp >= date_trunc('day', now())
          AND il.timestamp < date_trunc('day', now()) + interval '1 day') AS activity_today,
      (SELECT COALESCE(json_agg(json_build_object(
          'id', ls.id,
          'name', ls.name,
          'stock_quantity', ls.stock_quantity
        ) ORDER BY ls.stock_quantity ASC), '[]'::json)
       FROM (
         SELECT id, name, stock_quantity FROM products
         WHERE business_id = ${businessId} AND stock_quantity <= ${lowStockThreshold}
         ORDER BY stock_quantity ASC LIMIT ${lowStockLimit}
       ) ls) AS low_stock,
      (SELECT COALESCE(json_agg(json_build_object(
          'id', ra.id,
          'change_amount', ra.change_amount,
          'action_type', ra.action_type,
          'timestamp', ra.timestamp,
          'product_name', ra.product_name
        ) ORDER BY ra.ts DESC), '[]'::json)
       FROM (
         SELECT il.id, il.change_amount, il.action_type, il.timestamp, p.name AS product_name, il.timestamp AS ts
         FROM inventory_logs il
         JOIN products p ON p.id = il.product_id
         WHERE p.business_id = ${businessId}
         ORDER BY il.timestamp DESC LIMIT ${activityLimit}
       ) ra) AS recent_activity
  `;

  return {
    productsCount: row.products_count as number,
    categoriesCount: row.categories_count as number,
    staffCount: row.staff_count as number,
    activityToday: row.activity_today as number,
    lowStock: parseLowStockJson(row.low_stock),
    recentActivity: parseRecentActivityJson(row.recent_activity),
  };
}

export async function getCatalogPageBySlug(slug: string): Promise<{
  business: Business;
  products: PublicProduct[];
  categories: Category[];
} | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT
      b.*,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', p.id,
          'business_id', p.business_id,
          'category_id', p.category_id,
          'name', p.name,
          'description', p.description,
          'image_url', p.image_url,
          'price_text', p.price_text,
          'active', p.active,
          'created_at', p.created_at,
          'updated_at', p.updated_at
        ) ORDER BY p.name ASC)
         FROM products p
         WHERE p.business_id = b.id AND p.active = true),
        '[]'::json
      ) AS products_json,
      COALESCE(
        (SELECT json_agg(json_build_object(
          'id', c.id,
          'business_id', c.business_id,
          'name', c.name,
          'description', c.description,
          'created_at', c.created_at
        ) ORDER BY c.name ASC)
         FROM categories c
         WHERE c.business_id = b.id),
        '[]'::json
      ) AS categories_json
    FROM businesses b
    WHERE b.slug = ${slug}
    LIMIT 1
  `;

  const row = rows[0] as
    | (Business & { products_json: unknown; categories_json: unknown })
    | undefined;
  if (!row) return null;

  const productsRaw = Array.isArray(row.products_json) ? row.products_json : [];
  const categoriesRaw = Array.isArray(row.categories_json) ? row.categories_json : [];

  return {
    business: mapBusiness(row),
    products: castRows<ProductRow[]>(productsRaw).map(mapPublicProduct),
    categories: castRows<Category[]>(categoriesRaw),
  };
}

export async function getPublicProductPageBySlug(
  slug: string,
  productId: string,
): Promise<{
  business: Business;
  product: PublicProduct;
  category: Category | null;
} | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT
      b.*,
      p.id AS p_id,
      p.business_id AS p_business_id,
      p.category_id AS p_category_id,
      p.name AS p_name,
      p.description AS p_description,
      p.image_url AS p_image_url,
      p.price_text AS p_price_text,
      p.active AS p_active,
      p.created_at AS p_created_at,
      p.updated_at AS p_updated_at,
      c.id AS c_id,
      c.business_id AS c_business_id,
      c.name AS c_name,
      c.description AS c_description,
      c.created_at AS c_created_at
    FROM businesses b
    INNER JOIN products p ON p.business_id = b.id AND p.id = ${productId} AND p.active = true
    LEFT JOIN categories c ON c.id = p.category_id AND c.business_id = b.id
    WHERE b.slug = ${slug}
    LIMIT 1
  `;

  const row = rows[0] as
    | (Business & {
        p_id: string;
        p_business_id: string;
        p_category_id: string | null;
        p_name: string;
        p_description: string | null;
        p_image_url: string | null;
        p_price_text: string;
        p_active: boolean | number;
        p_created_at: string;
        p_updated_at: string;
        c_id: string | null;
        c_business_id: string | null;
        c_name: string | null;
        c_description: string | null;
        c_created_at: string | null;
      })
    | undefined;

  if (!row) return null;

  const business = mapBusiness(row);
  const product = mapPublicProduct(
    mapProduct({
      id: row.p_id,
      business_id: row.p_business_id,
      category_id: row.p_category_id,
      name: row.p_name,
      description: row.p_description,
      image_url: row.p_image_url,
      price_text: row.p_price_text,
      active: row.p_active,
      created_at: row.p_created_at,
      updated_at: row.p_updated_at,
      stock_quantity: 0,
    } as ProductRow),
  );

  const category =
    row.c_id && row.c_name && row.c_business_id
      ? {
          id: row.c_id,
          business_id: row.c_business_id,
          name: row.c_name,
          description: row.c_description,
          created_at: row.c_created_at ?? "",
        }
      : null;

  return { business, product, category };
}

export async function listActivityLogs(
  businessId: string,
  limit: number,
): Promise<
  Array<
    InventoryLog & {
      products: { name: string };
      profiles: { name: string | null; phone: string };
    }
  >
> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT il.*, p.name AS product_name,
           COALESCE(pr.name, sa.name, 'User') AS actor_name
    FROM inventory_logs il
    JOIN products p ON p.id = il.product_id
    LEFT JOIN profiles pr ON pr.id = il.user_id
    LEFT JOIN staff_accounts sa ON sa.id = il.staff_account_id
    WHERE p.business_id = ${businessId}
    ORDER BY il.timestamp DESC
    LIMIT ${limit}
  `;

  return castRows<
    Array<
      InventoryLog & {
        product_name: string;
        actor_name: string;
      }
    >
  >(rows).map((row) => ({
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

export async function getProductStock(
  productId: string,
  businessId: string,
): Promise<{ id: string; stock_quantity: number } | null> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT id, stock_quantity FROM products WHERE id = ${productId} AND business_id = ${businessId}
  `;
  return (rows[0] as { id: string; stock_quantity: number } | undefined) ?? null;
}

export async function listInventoryProducts(
  businessId: string,
): Promise<Array<{ id: string; name: string; stock_quantity: number; updated_at: string }>> {
  const sql = getPostgres();
  const rows = await sql`
    SELECT id, name, stock_quantity, updated_at FROM products
    WHERE business_id = ${businessId} ORDER BY name ASC
  `;
  return castRows<
    Array<{ id: string; name: string; stock_quantity: number; updated_at: string }>
  >(rows);
}
