import { AdminShell } from "@/components/admin/AdminNav";
import { InventoryControls } from "@/components/inventory/InventoryControls";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";

export default async function InventoryPage() {
  const { business, profile } = await requireBusinessContext();
  const products = await repo.listInventoryProducts(business.id);

  return (
    <AdminShell title="Inventory" businessName={business.name} role={profile.role}>
      <div className="mx-auto max-w-lg space-y-3">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <h2 className="font-display font-semibold uppercase text-brand-navy">
              {product.name}
            </h2>
            <div className="mt-3">
              <InventoryControls
                productId={product.id}
                stockQuantity={product.stock_quantity}
              />
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
