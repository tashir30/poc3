"use client";

import { useState } from "react";
import { createProduct, uploadProductImage } from "@/lib/actions/catalog";
import { AdminShell } from "@/components/admin/AdminNav";
import { Button, Card, Input, Label, Textarea } from "@/components/ui/Form";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  businessName: string;
  initial?: {
    id: string;
    name: string;
    description: string | null;
    price_text: string;
    category_id: string | null;
    image_url: string | null;
    active: boolean;
  };
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

export function ProductForm({
  categories,
  businessName,
  initial,
  action,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImage(formData);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.url) setImageUrl(result.url);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    if (imageUrl) formData.set("image_url", imageUrl);

    const result = await action(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AdminShell
      title={initial ? "Edit product" : "Add product"}
      businessName={businessName}
      role="admin"
    >
      <Card className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Product name</Label>
            <Input name="name" defaultValue={initial?.name} required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={initial?.description ?? ""}
              rows={3}
            />
          </div>
          <div>
            <Label>Price text</Label>
            <Input
              name="price_text"
              defaultValue={initial?.price_text ?? "Contact for Price"}
              placeholder="₹2500 or Contact for Price"
              required
            />
          </div>
          <div>
            <Label>Category</Label>
            <select
              name="category_id"
              defaultValue={initial?.category_id ?? ""}
              className="min-h-11 w-full rounded-lg border border-slate-300 px-3 focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Product image</Label>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {uploading && <p className="text-sm text-slate-500">Uploading...</p>}
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Preview"
                className="mt-2 h-40 w-full rounded-xl object-cover"
              />
            )}
          </div>
          {initial && (
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="active" defaultChecked={initial.active} />
              Visible in catalog
            </label>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Saving..." : "Save product"}
          </Button>
        </form>
      </Card>
    </AdminShell>
  );
}

export function NewProductClient({
  categories,
  businessName,
}: {
  categories: { id: string; name: string }[];
  businessName: string;
}) {
  return (
    <ProductForm
      categories={categories}
      businessName={businessName}
      action={createProduct}
    />
  );
}
