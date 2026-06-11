import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";
import { updateProduct } from "@/lib/actions/catalog";
import { ProductForm } from "@/components/products/ProductForm";
import { redirect, notFound } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { business, profile } = await requireBusinessContext();
  if (profile.role !== "admin") redirect("/inventory");

  const product = await repo.getProductById(id, business.id);
  const categories = await repo.listCategories(business.id);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      businessName={business.name}
      initial={product}
      action={updateProduct.bind(null, id)}
    />
  );
}
