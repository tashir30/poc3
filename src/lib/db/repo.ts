import "server-only";

import { isSupabaseBackend } from "@/lib/config/backend";

export async function insertOtpRequest(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertOtpRequest"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.insertOtpRequest(...(args as Parameters<(typeof postgres)["insertOtpRequest"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.insertOtpRequest(...(args as Parameters<(typeof sqlite)["insertOtpRequest"]>));
}

export async function getLatestOtpRequest(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getLatestOtpRequest"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getLatestOtpRequest(...(args as Parameters<(typeof postgres)["getLatestOtpRequest"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getLatestOtpRequest(...(args as Parameters<(typeof sqlite)["getLatestOtpRequest"]>));
}

export async function deleteOtpRequestsForPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteOtpRequestsForPhone"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.deleteOtpRequestsForPhone(...(args as Parameters<(typeof postgres)["deleteOtpRequestsForPhone"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.deleteOtpRequestsForPhone(...(args as Parameters<(typeof sqlite)["deleteOtpRequestsForPhone"]>));
}

export async function categoryBelongsToBusiness(
  ...args: Parameters<(typeof import("./sqlite-repo"))["categoryBelongsToBusiness"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.categoryBelongsToBusiness(...(args as Parameters<(typeof postgres)["categoryBelongsToBusiness"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.categoryBelongsToBusiness(...(args as Parameters<(typeof sqlite)["categoryBelongsToBusiness"]>));
}

export async function getUserByPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getUserByPhone"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getUserByPhone(...(args as Parameters<(typeof postgres)["getUserByPhone"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getUserByPhone(...(args as Parameters<(typeof sqlite)["getUserByPhone"]>));
}

export async function getUserById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getUserById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getUserById(...(args as Parameters<(typeof postgres)["getUserById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getUserById(...(args as Parameters<(typeof sqlite)["getUserById"]>));
}

export async function setUserPassword(
  ...args: Parameters<(typeof import("./sqlite-repo"))["setUserPassword"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.setUserPassword(...(args as Parameters<(typeof postgres)["setUserPassword"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.setUserPassword(...(args as Parameters<(typeof sqlite)["setUserPassword"]>));
}

export async function recordFailedMerchantLogin(
  ...args: Parameters<(typeof import("./sqlite-repo"))["recordFailedMerchantLogin"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.recordFailedMerchantLogin(...(args as Parameters<(typeof postgres)["recordFailedMerchantLogin"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.recordFailedMerchantLogin(...(args as Parameters<(typeof sqlite)["recordFailedMerchantLogin"]>));
}

export async function clearMerchantLoginFailures(
  ...args: Parameters<(typeof import("./sqlite-repo"))["clearMerchantLoginFailures"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.clearMerchantLoginFailures(...(args as Parameters<(typeof postgres)["clearMerchantLoginFailures"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.clearMerchantLoginFailures(...(args as Parameters<(typeof sqlite)["clearMerchantLoginFailures"]>));
}

export async function setPlatformAdminFlag(
  ...args: Parameters<(typeof import("./sqlite-repo"))["setPlatformAdminFlag"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.setPlatformAdminFlag(...(args as Parameters<(typeof postgres)["setPlatformAdminFlag"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.setPlatformAdminFlag(...(args as Parameters<(typeof sqlite)["setPlatformAdminFlag"]>));
}

export async function createUser(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createUser"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.createUser(...(args as Parameters<(typeof postgres)["createUser"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.createUser(...(args as Parameters<(typeof sqlite)["createUser"]>));
}

export async function ensureUser(
  ...args: Parameters<(typeof import("./sqlite-repo"))["ensureUser"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.ensureUser(...(args as Parameters<(typeof postgres)["ensureUser"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.ensureUser(...(args as Parameters<(typeof sqlite)["ensureUser"]>));
}

export async function getProfileById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProfileById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getProfileById(...(args as Parameters<(typeof postgres)["getProfileById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getProfileById(...(args as Parameters<(typeof sqlite)["getProfileById"]>));
}

export async function getProfileByPhone(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProfileByPhone"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getProfileByPhone(...(args as Parameters<(typeof postgres)["getProfileByPhone"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getProfileByPhone(...(args as Parameters<(typeof sqlite)["getProfileByPhone"]>));
}

export async function ensureProfile(
  ...args: Parameters<(typeof import("./sqlite-repo"))["ensureProfile"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.ensureProfile(...(args as Parameters<(typeof postgres)["ensureProfile"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.ensureProfile(...(args as Parameters<(typeof sqlite)["ensureProfile"]>));
}

export async function updateProfile(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProfile"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateProfile(...(args as Parameters<(typeof postgres)["updateProfile"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateProfile(...(args as Parameters<(typeof sqlite)["updateProfile"]>));
}

export async function getBusinessById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getBusinessById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getBusinessById(...(args as Parameters<(typeof postgres)["getBusinessById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getBusinessById(...(args as Parameters<(typeof sqlite)["getBusinessById"]>));
}

export async function getBusinessBySlug(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getBusinessBySlug"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getBusinessBySlug(...(args as Parameters<(typeof postgres)["getBusinessBySlug"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getBusinessBySlug(...(args as Parameters<(typeof sqlite)["getBusinessBySlug"]>));
}

export async function slugExists(
  ...args: Parameters<(typeof import("./sqlite-repo"))["slugExists"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.slugExists(...(args as Parameters<(typeof postgres)["slugExists"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.slugExists(...(args as Parameters<(typeof sqlite)["slugExists"]>));
}

export async function createBusiness(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createBusiness"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.createBusiness(...(args as Parameters<(typeof postgres)["createBusiness"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.createBusiness(...(args as Parameters<(typeof sqlite)["createBusiness"]>));
}

export async function updateBusinessCatalogTheme(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateBusinessCatalogTheme"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateBusinessCatalogTheme(...(args as Parameters<(typeof postgres)["updateBusinessCatalogTheme"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateBusinessCatalogTheme(...(args as Parameters<(typeof sqlite)["updateBusinessCatalogTheme"]>));
}

export async function countCategories(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countCategories"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.countCategories(...(args as Parameters<(typeof postgres)["countCategories"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.countCategories(...(args as Parameters<(typeof sqlite)["countCategories"]>));
}

export async function listCategories(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listCategories"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listCategories(...(args as Parameters<(typeof postgres)["listCategories"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listCategories(...(args as Parameters<(typeof sqlite)["listCategories"]>));
}

export async function insertCategory(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertCategory"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.insertCategory(...(args as Parameters<(typeof postgres)["insertCategory"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.insertCategory(...(args as Parameters<(typeof sqlite)["insertCategory"]>));
}

export async function deleteCategoryById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteCategoryById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.deleteCategoryById(...(args as Parameters<(typeof postgres)["deleteCategoryById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.deleteCategoryById(...(args as Parameters<(typeof sqlite)["deleteCategoryById"]>));
}

export async function countProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countProducts"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.countProducts(...(args as Parameters<(typeof postgres)["countProducts"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.countProducts(...(args as Parameters<(typeof sqlite)["countProducts"]>));
}

export async function listProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listProducts"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listProducts(...(args as Parameters<(typeof postgres)["listProducts"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listProducts(...(args as Parameters<(typeof sqlite)["listProducts"]>));
}

export async function listProductsWithCategory(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listProductsWithCategory"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listProductsWithCategory(...(args as Parameters<(typeof postgres)["listProductsWithCategory"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listProductsWithCategory(...(args as Parameters<(typeof sqlite)["listProductsWithCategory"]>));
}

export async function getProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProductById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getProductById(...(args as Parameters<(typeof postgres)["getProductById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getProductById(...(args as Parameters<(typeof sqlite)["getProductById"]>));
}

export async function insertProduct(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertProduct"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.insertProduct(...(args as Parameters<(typeof postgres)["insertProduct"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.insertProduct(...(args as Parameters<(typeof sqlite)["insertProduct"]>));
}

export async function updateProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProductById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateProductById(...(args as Parameters<(typeof postgres)["updateProductById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateProductById(...(args as Parameters<(typeof sqlite)["updateProductById"]>));
}

export async function deleteProductById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteProductById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.deleteProductById(...(args as Parameters<(typeof postgres)["deleteProductById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.deleteProductById(...(args as Parameters<(typeof sqlite)["deleteProductById"]>));
}

export async function listPublicProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listPublicProducts"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listPublicProducts(...(args as Parameters<(typeof postgres)["listPublicProducts"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listPublicProducts(...(args as Parameters<(typeof sqlite)["listPublicProducts"]>));
}

export async function getPublicProduct(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getPublicProduct"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getPublicProduct(...(args as Parameters<(typeof postgres)["getPublicProduct"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getPublicProduct(...(args as Parameters<(typeof sqlite)["getPublicProduct"]>));
}

export async function updateProductStock(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateProductStock"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateProductStock(...(args as Parameters<(typeof postgres)["updateProductStock"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateProductStock(...(args as Parameters<(typeof sqlite)["updateProductStock"]>));
}

export async function insertInventoryLog(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertInventoryLog"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.insertInventoryLog(...(args as Parameters<(typeof postgres)["insertInventoryLog"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.insertInventoryLog(...(args as Parameters<(typeof sqlite)["insertInventoryLog"]>));
}

export async function countDailyActivity(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countDailyActivity"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.countDailyActivity(...(args as Parameters<(typeof postgres)["countDailyActivity"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.countDailyActivity(...(args as Parameters<(typeof sqlite)["countDailyActivity"]>));
}

export async function countStaff(
  ...args: Parameters<(typeof import("./sqlite-repo"))["countStaff"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.countStaff(...(args as Parameters<(typeof postgres)["countStaff"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.countStaff(...(args as Parameters<(typeof sqlite)["countStaff"]>));
}

export async function listStaff(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listStaff"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listStaff(...(args as Parameters<(typeof postgres)["listStaff"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listStaff(...(args as Parameters<(typeof sqlite)["listStaff"]>));
}

export async function getStaffByUsername(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getStaffByUsername"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getStaffByUsername(...(args as Parameters<(typeof postgres)["getStaffByUsername"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getStaffByUsername(...(args as Parameters<(typeof sqlite)["getStaffByUsername"]>));
}

export async function getStaffById(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getStaffById"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getStaffById(...(args as Parameters<(typeof postgres)["getStaffById"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getStaffById(...(args as Parameters<(typeof sqlite)["getStaffById"]>));
}

export async function createStaffAccount(
  ...args: Parameters<(typeof import("./sqlite-repo"))["createStaffAccount"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.createStaffAccount(...(args as Parameters<(typeof postgres)["createStaffAccount"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.createStaffAccount(...(args as Parameters<(typeof sqlite)["createStaffAccount"]>));
}

export async function updateStaffStatus(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateStaffStatus"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateStaffStatus(...(args as Parameters<(typeof postgres)["updateStaffStatus"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateStaffStatus(...(args as Parameters<(typeof sqlite)["updateStaffStatus"]>));
}

export async function deleteStaffAccount(
  ...args: Parameters<(typeof import("./sqlite-repo"))["deleteStaffAccount"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.deleteStaffAccount(...(args as Parameters<(typeof postgres)["deleteStaffAccount"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.deleteStaffAccount(...(args as Parameters<(typeof sqlite)["deleteStaffAccount"]>));
}

export async function resetStaffPassword(
  ...args: Parameters<(typeof import("./sqlite-repo"))["resetStaffPassword"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.resetStaffPassword(...(args as Parameters<(typeof postgres)["resetStaffPassword"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.resetStaffPassword(...(args as Parameters<(typeof sqlite)["resetStaffPassword"]>));
}

export async function recordFailedStaffLogin(
  ...args: Parameters<(typeof import("./sqlite-repo"))["recordFailedStaffLogin"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.recordFailedStaffLogin(...(args as Parameters<(typeof postgres)["recordFailedStaffLogin"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.recordFailedStaffLogin(...(args as Parameters<(typeof sqlite)["recordFailedStaffLogin"]>));
}

export async function clearStaffLoginFailures(
  ...args: Parameters<(typeof import("./sqlite-repo"))["clearStaffLoginFailures"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.clearStaffLoginFailures(...(args as Parameters<(typeof postgres)["clearStaffLoginFailures"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.clearStaffLoginFailures(...(args as Parameters<(typeof sqlite)["clearStaffLoginFailures"]>));
}

export async function updateBusinessPlan(
  ...args: Parameters<(typeof import("./sqlite-repo"))["updateBusinessPlan"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.updateBusinessPlan(...(args as Parameters<(typeof postgres)["updateBusinessPlan"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.updateBusinessPlan(...(args as Parameters<(typeof sqlite)["updateBusinessPlan"]>));
}

export async function insertSubscription(
  ...args: Parameters<(typeof import("./sqlite-repo"))["insertSubscription"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.insertSubscription(...(args as Parameters<(typeof postgres)["insertSubscription"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.insertSubscription(...(args as Parameters<(typeof sqlite)["insertSubscription"]>));
}

export async function completeSubscription(
  ...args: Parameters<(typeof import("./sqlite-repo"))["completeSubscription"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.completeSubscription(...(args as Parameters<(typeof postgres)["completeSubscription"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.completeSubscription(...(args as Parameters<(typeof sqlite)["completeSubscription"]>));
}

export async function listPlatformBusinesses(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listPlatformBusinesses"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listPlatformBusinesses(...(args as Parameters<(typeof postgres)["listPlatformBusinesses"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listPlatformBusinesses(...(args as Parameters<(typeof sqlite)["listPlatformBusinesses"]>));
}

export async function getPlatformStats(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getPlatformStats"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getPlatformStats(...(args as Parameters<(typeof postgres)["getPlatformStats"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getPlatformStats(...(args as Parameters<(typeof sqlite)["getPlatformStats"]>));
}

export async function listLowStockProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listLowStockProducts"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listLowStockProducts(...(args as Parameters<(typeof postgres)["listLowStockProducts"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listLowStockProducts(...(args as Parameters<(typeof sqlite)["listLowStockProducts"]>));
}

export async function listRecentActivity(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listRecentActivity"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listRecentActivity(...(args as Parameters<(typeof postgres)["listRecentActivity"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listRecentActivity(...(args as Parameters<(typeof sqlite)["listRecentActivity"]>));
}

export async function listActivityLogs(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listActivityLogs"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listActivityLogs(...(args as Parameters<(typeof postgres)["listActivityLogs"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listActivityLogs(...(args as Parameters<(typeof sqlite)["listActivityLogs"]>));
}

export async function getProductStock(
  ...args: Parameters<(typeof import("./sqlite-repo"))["getProductStock"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.getProductStock(...(args as Parameters<(typeof postgres)["getProductStock"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.getProductStock(...(args as Parameters<(typeof sqlite)["getProductStock"]>));
}

export async function listInventoryProducts(
  ...args: Parameters<(typeof import("./sqlite-repo"))["listInventoryProducts"]>
) {
  if (isSupabaseBackend()) {
    const postgres = await import("./postgres-repo");
    return postgres.listInventoryProducts(...(args as Parameters<(typeof postgres)["listInventoryProducts"]>));
  }
  const sqlite = await import("./sqlite-repo");
  return sqlite.listInventoryProducts(...(args as Parameters<(typeof sqlite)["listInventoryProducts"]>));
}
