import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertSupabaseEnv } from "@/lib/config/backend";

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  assertSupabaseEnv();
  if (!adminClient) {
    adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );
  }
  return adminClient;
}

export const PRODUCT_IMAGES_BUCKET = "product-images";
