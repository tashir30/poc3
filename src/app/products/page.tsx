import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminNav";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";
import { deleteProduct } from "@/lib/actions/catalog";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  const { business, profile } = await requireBusinessContext();

  if (profile.role !== "admin") {
    redirect("/inventory");
  }

  const products = await repo.listProductsWithCategory(business.id);

  return (
    <AdminShell title="Products" businessName={business.name} role={profile.role}>
      <div className="space-y-4">
        <Link
          href="/products/new"
          className="inline-flex min-h-11 items-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-brand-orange-dark"
        >
          Add product
        </Link>

        <div className="space-y-3">
          {products.map((product) => {
            const deleteAction = deleteProduct.bind(null, product.id);

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {product.categories?.name ? (
                      <p className="text-xs font-bold uppercase tracking-wide text-brand-orange">
                        {product.categories.name}
                      </p>
                    ) : null}
                    <h2 className="font-display mt-1 text-lg font-semibold uppercase text-brand-navy">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {product.price_text}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Stock: {product.stock_quantity} ·{" "}
                      {product.active ? "Active" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="text-sm font-bold uppercase tracking-wide text-brand-orange hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteAction}>
                      <button
                        type="submit"
                        className="text-sm font-bold uppercase tracking-wide text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
