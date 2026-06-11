import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";
import { NewProductClient } from "@/components/products/ProductForm";
import { redirect } from "next/navigation";

export default async function NewProductPage() {
  const { business, profile } = await requireBusinessContext();
  if (profile.role !== "admin") redirect("/inventory");

  const categories = await repo.listCategories(business.id);

  return (
    <NewProductClient
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      businessName={business.name}
    />
  );
}
