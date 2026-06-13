import { AdminShell } from "@/components/admin/AdminNav";
import { DeleteSubmitButton } from "@/components/admin/DeleteSubmitButton";
import * as repo from "@/lib/db/repo";
import { requireBusinessContext } from "@/lib/session";
import { deleteCategoryAction } from "@/lib/actions/category-actions";
import { createCategory } from "@/lib/actions/catalog";
import { Card, Input, Label } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const { business, profile } = await requireBusinessContext();
  if (profile.role !== "admin") redirect("/inventory");

  const categories = await repo.listCategories(business.id);

  return (
    <AdminShell title="Categories" businessName={business.name} role={profile.role}>
      <div className="mx-auto max-w-lg space-y-4">
        <Card>
          <form action={createCategory} className="space-y-3">
            <div>
              <Label>Category name</Label>
              <Input name="name" required placeholder="Cricket" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input name="description" placeholder="Bats, balls, pads..." />
            </div>
            <SubmitButton pendingLabel="Adding..." fullWidth>
              Add category
            </SubmitButton>
          </form>
        </Card>

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div>
                <p className="font-display font-semibold uppercase text-brand-navy">
                  {category.name}
                </p>
                {category.description && (
                  <p className="text-sm text-slate-500">{category.description}</p>
                )}
              </div>
              <form action={deleteCategoryAction.bind(null, category.id)}>
                <DeleteSubmitButton />
              </form>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
