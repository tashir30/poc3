import "server-only";

import fs from "fs";
import path from "path";
import { isSupabaseBackend } from "@/lib/config/backend";
import {
  detectImageType,
  extensionForImageType,
} from "@/lib/security/image";
import { getSupabaseAdmin, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase/server";

export async function uploadProductImage(
  businessId: string,
  buffer: Buffer,
): Promise<{ url: string }> {
  const detectedType = detectImageType(buffer);
  if (!detectedType) {
    throw new Error("Invalid image type");
  }

  const ext = extensionForImageType(detectedType);
  const filename = `${crypto.randomUUID()}.${ext}`;

  if (isSupabaseBackend()) {
    const supabase = getSupabaseAdmin();
    const objectPath = `${businessId}/${filename}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(objectPath, buffer, {
        contentType: `image/${detectedType === "jpeg" ? "jpeg" : detectedType}`,
        upsert: false,
      });

    if (error) {
      throw new Error(error.message);
    }

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(/\/$/, "");
    return {
      url: `${base}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${objectPath}`,
    };
  }

  const dir = path.join(process.cwd(), "public", "uploads", businessId);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return { url: `/uploads/${businessId}/${filename}` };
}
