import "server-only";

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { normalizePhone } from "@/lib/validation";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  password_updated_at TEXT,
  must_change_password INTEGER NOT NULL DEFAULT 0,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  is_platform_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  whatsapp_number TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  catalog_theme TEXT NOT NULL DEFAULT 'warm',
  plan TEXT NOT NULL DEFAULT 'free',
  plan_status TEXT NOT NULL DEFAULT 'active',
  plan_expires_at TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL UNIQUE,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'sales')),
  business_id TEXT REFERENCES businesses(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS staff_accounts (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
  must_change_password INTEGER NOT NULL DEFAULT 1,
  failed_login_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deactivated_at TEXT,
  UNIQUE (business_id, username)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (business_id, name)
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price_text TEXT NOT NULL DEFAULT 'Contact for Price',
  stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  staff_account_id TEXT REFERENCES staff_accounts(id) ON DELETE SET NULL,
  change_amount INTEGER NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('SALE', 'STOCK_ADDED', 'MANUAL_ADJUSTMENT')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS otp_requests (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  otp_hash TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_phone TEXT NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  plan TEXT NOT NULL DEFAULT 'paid',
  status TEXT NOT NULL DEFAULT 'pending',
  amount_paise INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  current_period_start TEXT,
  current_period_end TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  business_id TEXT,
  payload_hash TEXT NOT NULL,
  processed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_business ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_business ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_product ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_timestamp ON inventory_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone ON otp_requests(phone, expires_at);
CREATE INDEX IF NOT EXISTS idx_staff_accounts_business ON staff_accounts(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
`;

let db: Database.Database | null = null;

function getDatabasePath(): string {
  const configured = process.env.DATABASE_PATH;
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "data", "poc3.db");
}

function tableExists(database: Database.Database, tableName: string): boolean {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(tableName) as { name: string } | undefined;
  return !!row;
}

function columnExists(
  database: Database.Database,
  tableName: string,
  columnName: string,
): boolean {
  const columns = database
    .prepare(`PRAGMA table_info(${tableName})`)
    .all() as { name: string }[];
  return columns.some((column) => column.name === columnName);
}

function addColumnIfMissing(
  database: Database.Database,
  tableName: string,
  ddl: string,
  columnName: string,
): void {
  if (!columnExists(database, tableName, columnName)) {
    database.exec(`ALTER TABLE ${tableName} ADD COLUMN ${ddl}`);
  }
}

function runMigrations(database: Database.Database): void {
  addColumnIfMissing(
    database,
    "businesses",
    "catalog_theme TEXT NOT NULL DEFAULT 'warm'",
    "catalog_theme",
  );
  addColumnIfMissing(database, "businesses", "plan TEXT NOT NULL DEFAULT 'free'", "plan");
  addColumnIfMissing(
    database,
    "businesses",
    "plan_status TEXT NOT NULL DEFAULT 'active'",
    "plan_status",
  );
  addColumnIfMissing(database, "businesses", "plan_expires_at TEXT", "plan_expires_at");
  addColumnIfMissing(
    database,
    "businesses",
    "timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata'",
    "timezone",
  );

  addColumnIfMissing(database, "users", "password_hash TEXT", "password_hash");
  addColumnIfMissing(database, "users", "password_updated_at TEXT", "password_updated_at");
  addColumnIfMissing(
    database,
    "users",
    "must_change_password INTEGER NOT NULL DEFAULT 0",
    "must_change_password",
  );
  addColumnIfMissing(
    database,
    "users",
    "failed_login_attempts INTEGER NOT NULL DEFAULT 0",
    "failed_login_attempts",
  );
  addColumnIfMissing(database, "users", "locked_until TEXT", "locked_until");
  addColumnIfMissing(
    database,
    "users",
    "is_platform_admin INTEGER NOT NULL DEFAULT 0",
    "is_platform_admin",
  );

  addColumnIfMissing(database, "otp_requests", "otp_hash TEXT", "otp_hash");
  addColumnIfMissing(
    database,
    "inventory_logs",
    "staff_account_id TEXT REFERENCES staff_accounts(id) ON DELETE SET NULL",
    "staff_account_id",
  );

  if (!tableExists(database, "staff_accounts")) {
    database.exec(`
      CREATE TABLE staff_accounts (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
        must_change_password INTEGER NOT NULL DEFAULT 1,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        deactivated_at TEXT,
        UNIQUE (business_id, username)
      );
      CREATE INDEX IF NOT EXISTS idx_staff_accounts_business ON staff_accounts(business_id);
    `);
  }

  if (!tableExists(database, "subscriptions")) {
    database.exec(`
      CREATE TABLE subscriptions (
        id TEXT PRIMARY KEY,
        business_id TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
        user_phone TEXT NOT NULL,
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        plan TEXT NOT NULL DEFAULT 'paid',
        status TEXT NOT NULL DEFAULT 'pending',
        amount_paise INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'INR',
        current_period_start TEXT,
        current_period_end TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
    `);
  }

  if (!tableExists(database, "payment_events")) {
    database.exec(`
      CREATE TABLE payment_events (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL UNIQUE,
        business_id TEXT,
        payload_hash TEXT NOT NULL,
        processed_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }

  syncPlatformAdmins(database);
}

function syncPlatformAdmins(database: Database.Database): void {
  const raw = process.env.ELEVO_PLATFORM_ADMIN_PHONES ?? "";
  const phones = raw
    .split(",")
    .map((value) => normalizePhone(value.trim()))
    .filter((value): value is string => value !== null && value.length > 0);

  for (const phone of phones) {
    database
      .prepare("UPDATE users SET is_platform_admin = 1 WHERE phone = ?")
      .run(phone);
  }
}

function initSchema(database: Database.Database): void {
  database.exec(SCHEMA);
  runMigrations(database);
}

export function getDb(): Database.Database {
  if (db) {
    return db;
  }

  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), "public", "uploads"), { recursive: true });

  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);

  return db;
}

export function newId(): string {
  return crypto.randomUUID();
}

export function boolFromDb(value: number | boolean): boolean {
  return value === true || value === 1;
}

export function boolToDb(value: boolean): number {
  return value ? 1 : 0;
}
