export type UserRole = "admin" | "sales";

export type AccountType = "merchant" | "staff";

export type BusinessPlanId = "free" | "paid";

export type PlanStatus = "active" | "past_due" | "cancelled";

export type StaffStatus = "active" | "inactive" | "deleted";

export type CatalogThemeId =
  | "warm"
  | "ocean"
  | "forest"
  | "rose"
  | "slate"
  | "bold";

export type InventoryActionType =
  | "SALE"
  | "STOCK_ADDED"
  | "MANUAL_ADJUSTMENT";

export interface User {
  id: string;
  phone: string;
  password_hash: string | null;
  password_updated_at: string | null;
  must_change_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  is_platform_admin: boolean;
  created_at: string;
}

export interface Business {
  id: string;
  owner_user_id: string;
  name: string;
  slug: string;
  whatsapp_number: string;
  logo_url: string | null;
  description: string | null;
  instagram_url: string | null;
  catalog_theme: CatalogThemeId;
  plan: BusinessPlanId;
  plan_status: PlanStatus;
  plan_expires_at: string | null;
  timezone: string;
  created_at: string;
}

export interface Profile {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  business_id: string | null;
  created_at: string;
}

export interface StaffAccount {
  id: string;
  business_id: string;
  name: string;
  contact_phone: string;
  username: string;
  password_hash: string;
  status: StaffStatus;
  must_change_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  created_at: string;
  deactivated_at: string | null;
}

export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price_text: string;
  stock_quantity: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicProduct {
  id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  image_url: string | null;
  price_text: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  user_id: string | null;
  staff_account_id: string | null;
  change_amount: number;
  action_type: InventoryActionType;
  timestamp: string;
}

export interface InventoryLogWithDetails extends InventoryLog {
  product_name: string;
  user_name: string | null;
}

export interface Subscription {
  id: string;
  business_id: string;
  user_phone: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  plan: BusinessPlanId;
  status: string;
  amount_paise: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}
