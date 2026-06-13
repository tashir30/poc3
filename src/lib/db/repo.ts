import "server-only";

import { isSupabaseBackend } from "@/lib/config/backend";

type SqliteRepo = typeof import("./sqlite-repo");
type PostgresRepo = typeof import("./postgres-repo");

let sqliteRepo: SqliteRepo | undefined;
let postgresRepo: PostgresRepo | undefined;

async function getSqliteRepo(): Promise<SqliteRepo> {
  sqliteRepo ??= await import("./sqlite-repo");
  return sqliteRepo;
}

async function getPostgresRepo(): Promise<PostgresRepo> {
  postgresRepo ??= await import("./postgres-repo");
  return postgresRepo;
}

async function getBackendRepo(): Promise<SqliteRepo | PostgresRepo> {
  return isSupabaseBackend() ? getPostgresRepo() : getSqliteRepo();
}

export async function insertOtpRequest(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertOtpRequest"]>
) {
  const impl = await getBackendRepo();
  return impl.insertOtpRequest(...args);
}

export async function getLatestOtpRequest(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getLatestOtpRequest"]>
) {
  const impl = await getBackendRepo();
  return impl.getLatestOtpRequest(...args);
}

export async function deleteOtpRequestsForPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteOtpRequestsForPhone"]>
) {
  const impl = await getBackendRepo();
  return impl.deleteOtpRequestsForPhone(...args);
}

export async function categoryBelongsToBusiness(
  ...args: Parameters<(typeof import("./sqlite-repo"))["categoryBelongsToBusiness"]>
) {
  const impl = await getBackendRepo();
  return impl.categoryBelongsToBusiness(...args);
}

export async function getUserByPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getUserByPhone"]>
) {
  const impl = await getBackendRepo();
  return impl.getUserByPhone(...args);
}

export async function getUserById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getUserById"]>
) {
  const impl = await getBackendRepo();
  return impl.getUserById(...args);
}

export async function setUserPassword(
  ...args: Parameters<(typeof import("./sqlite-repo"))["setUserPassword"]>
) {
  const impl = await getBackendRepo();
  return impl.setUserPassword(...args);
}

export async function recordFailedMerchantLogin(
  ...args: Parameters<(typeof import("./sqlite-repo"))["recordFailedMerchantLogin"]>
) {
  const impl = await getBackendRepo();
  return impl.recordFailedMerchantLogin(...args);
}

export async function clearMerchantLoginFailures(
  ...args: Parameters<(typeof import("./sqlite-repo"))["clearMerchantLoginFailures"]>
) {
  const impl = await getBackendRepo();
  return impl.clearMerchantLoginFailures(...args);
}

export async function setPlatformAdminFlag(
  ...args: Parameters<(typeof import("./sqlite-repo"))["setPlatformAdminFlag"]>
) {
  const impl = await getBackendRepo();
  return impl.setPlatformAdminFlag(...args);
}

export async function createUser(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createUser"]>
) {
  const impl = await getBackendRepo();
  return impl.createUser(...args);
}

export async function ensureUser(
  ...args: Parameters<(typeof import("./sqlite-repo"))["ensureUser"]>
) {
  const impl = await getBackendRepo();
  return impl.ensureUser(...args);
}

export async function getProfileById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProfileById"]>
) {
  const impl = await getBackendRepo();
  return impl.getProfileById(...args);
}

export async function getProfileByPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProfileByPhone"]>
) {
  const impl = await getBackendRepo();
  return impl.getProfileByPhone(...args);
}

export async function ensureProfile(
  ...args: Parameters<(typeof import("./sqlite-repo"))["ensureProfile"]>
) {
  const impl = await getBackendRepo();
  return impl.ensureProfile(...args);
}

export async function updateProfile(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProfile"]>
) {
  const impl = await getBackendRepo();
  return impl.updateProfile(...args);
}

export async function getBusinessById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getBusinessById"]>
) {
  const impl = await getBackendRepo();
  return impl.getBusinessById(...args);
}

export async function getBusinessBySlug(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getBusinessBySlug"]>
) {
  const impl = await getBackendRepo();
  return impl.getBusinessBySlug(...args);
}

export async function slugExists(
  ...args: Parameters<(typeof import("./sqlite-repo"))["slugExists"]>
) {
  const impl = await getBackendRepo();
  return impl.slugExists(...args);
}

export async function createBusiness(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createBusiness"]>
) {
  const impl = await getBackendRepo();
  return impl.createBusiness(...args);
}

export async function updateBusinessCatalogTheme(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateBusinessCatalogTheme"]>
) {
  const impl = await getBackendRepo();
  return impl.updateBusinessCatalogTheme(...args);
}

export async function updateBusinessById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateBusinessById"]>
) {
  const impl = await getBackendRepo();
  return impl.updateBusinessById(...args);
}

export async function getCategoryById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getCategoryById"]>
) {
  const impl = await getBackendRepo();
  return impl.getCategoryById(...args);
}

export async function countCategories(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countCategories"]>
) {
  const impl = await getBackendRepo();
  return impl.countCategories(...args);
}

export async function listCategories(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listCategories"]>
) {
  const impl = await getBackendRepo();
  return impl.listCategories(...args);
}

export async function insertCategory(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertCategory"]>
) {
  const impl = await getBackendRepo();
  return impl.insertCategory(...args);
}

export async function deleteCategoryById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteCategoryById"]>
) {
  const impl = await getBackendRepo();
  return impl.deleteCategoryById(...args);
}

export async function countProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countProducts"]>
) {
  const impl = await getBackendRepo();
  return impl.countProducts(...args);
}

export async function listProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listProducts"]>
) {
  const impl = await getBackendRepo();
  return impl.listProducts(...args);
}

export async function listProductsWithCategory(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listProductsWithCategory"]>
) {
  const impl = await getBackendRepo();
  return impl.listProductsWithCategory(...args);
}

export async function getProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProductById"]>
) {
  const impl = await getBackendRepo();
  return impl.getProductById(...args);
}

export async function insertProduct(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertProduct"]>
) {
  const impl = await getBackendRepo();
  return impl.insertProduct(...args);
}

export async function updateProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProductById"]>
) {
  const impl = await getBackendRepo();
  return impl.updateProductById(...args);
}

export async function deleteProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteProductById"]>
) {
  const impl = await getBackendRepo();
  return impl.deleteProductById(...args);
}

export async function listPublicProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listPublicProducts"]>
) {
  const impl = await getBackendRepo();
  return impl.listPublicProducts(...args);
}

export async function getPublicProduct(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getPublicProduct"]>
) {
  const impl = await getBackendRepo();
  return impl.getPublicProduct(...args);
}

export async function updateProductStock(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProductStock"]>
) {
  const impl = await getBackendRepo();
  return impl.updateProductStock(...args);
}

export async function insertInventoryLog(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertInventoryLog"]>
) {
  const impl = await getBackendRepo();
  return impl.insertInventoryLog(...args);
}

export async function countDailyActivity(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countDailyActivity"]>
) {
  const impl = await getBackendRepo();
  return impl.countDailyActivity(...args);
}

export async function countStaff(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countStaff"]>
) {
  const impl = await getBackendRepo();
  return impl.countStaff(...args);
}

export async function listStaff(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listStaff"]>
) {
  const impl = await getBackendRepo();
  return impl.listStaff(...args);
}

export async function getStaffByUsername(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getStaffByUsername"]>
) {
  const impl = await getBackendRepo();
  return impl.getStaffByUsername(...args);
}

export async function getStaffById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getStaffById"]>
) {
  const impl = await getBackendRepo();
  return impl.getStaffById(...args);
}

export async function createStaffAccount(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createStaffAccount"]>
) {
  const impl = await getBackendRepo();
  return impl.createStaffAccount(...args);
}

export async function updateStaffStatus(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateStaffStatus"]>
) {
  const impl = await getBackendRepo();
  return impl.updateStaffStatus(...args);
}

export async function deleteStaffAccount(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteStaffAccount"]>
) {
  const impl = await getBackendRepo();
  return impl.deleteStaffAccount(...args);
}

export async function resetStaffPassword(
  ...args: Parameters<(typeof import("./sqlite-repo"))["resetStaffPassword"]>
) {
  const impl = await getBackendRepo();
  return impl.resetStaffPassword(...args);
}

export async function recordFailedStaffLogin(
  ...args: Parameters<(typeof import("./sqlite-repo"))["recordFailedStaffLogin"]>
) {
  const impl = await getBackendRepo();
  return impl.recordFailedStaffLogin(...args);
}

export async function clearStaffLoginFailures(
  ...args: Parameters<(typeof import("./sqlite-repo"))["clearStaffLoginFailures"]>
) {
  const impl = await getBackendRepo();
  return impl.clearStaffLoginFailures(...args);
}

export async function updateBusinessPlan(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateBusinessPlan"]>
) {
  const impl = await getBackendRepo();
  return impl.updateBusinessPlan(...args);
}

export async function insertSubscription(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertSubscription"]>
) {
  const impl = await getBackendRepo();
  return impl.insertSubscription(...args);
}

export async function completeSubscription(
  ...args: Parameters<(typeof import("./sqlite-repo"))["completeSubscription"]>
) {
  const impl = await getBackendRepo();
  return impl.completeSubscription(...args);
}

export async function listPlatformBusinesses(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listPlatformBusinesses"]>
) {
  const impl = await getBackendRepo();
  return impl.listPlatformBusinesses(...args);
}

export async function getPlatformStats(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getPlatformStats"]>
) {
  const impl = await getBackendRepo();
  return impl.getPlatformStats(...args);
}

export async function listLowStockProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listLowStockProducts"]>
) {
  const impl = await getBackendRepo();
  return impl.listLowStockProducts(...args);
}

export async function listRecentActivity(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listRecentActivity"]>
) {
  const impl = await getBackendRepo();
  return impl.listRecentActivity(...args);
}

export async function listActivityLogs(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listActivityLogs"]>
) {
  const impl = await getBackendRepo();
  return impl.listActivityLogs(...args);
}

export async function getProductStock(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProductStock"]>
) {
  const impl = await getBackendRepo();
  return impl.getProductStock(...args);
}

export async function listInventoryProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listInventoryProducts"]>
) {
  const impl = await getBackendRepo();
  return impl.listInventoryProducts(...args);
}

export async function getDashboardSnapshot(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getDashboardSnapshot"]>
) {
  const impl = await getBackendRepo();
  return impl.getDashboardSnapshot(...args);
}

export async function getCatalogPageBySlug(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getCatalogPageBySlug"]>
) {
  const impl = await getBackendRepo();
  return impl.getCatalogPageBySlug(...args);
}

export async function getPublicProductPageBySlug(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getPublicProductPageBySlug"]>
) {
  const impl = await getBackendRepo();
  return impl.getPublicProductPageBySlug(...args);
}
