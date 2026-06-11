"use server";

import { deleteCategory } from "@/lib/actions/catalog";
import { requireBusinessContext } from "@/lib/session";
import { redirect } from "next/navigation";

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const { profile } = await requireBusinessContext();
  if (profile.role !== "admin") redirect("/inventory");
  await deleteCategory(categoryId);
}
