"use client";

import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { createProduct, uploadProductImage } from "@/lib/actions/catalog";
import { LIMITS } from "@/lib/constants";
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
    image_urls?: string[];
    active: boolean;
  };
  action: (formData: FormData) => Promise<{ error?: string } | void>;
}

function initialImageUrls(initial?: ProductFormProps["initial"]): string[] {
  if (initial?.image_urls && initial.image_urls.length > 0) {
    return initial.image_urls;
  }
  if (initial?.image_url) {
    return [initial.image_url];
  }
  return [];
}

export function ProductForm({
  categories,
  businessName,
  initial,
  action,
}: ProductFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(() =>
    initialImageUrls(initial),
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = LIMITS.maxProductImages - imageUrls.length;
    if (remaining <= 0) {
      setError(`You can add up to ${LIMITS.maxProductImages} images per product.`);
      e.target.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadProductImage(formData);
        if (result.error) {
          setError(result.error);
          break;
        }
        if (result.url) uploaded.push(result.url);
      }
      if (uploaded.length > 0) {
        setImageUrls((prev) => [...prev, ...uploaded].slice(0, LIMITS.maxProductImages));
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function moveImage(index: number, direction: -1 | 1) {
    setImageUrls((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("image_urls", JSON.stringify(imageUrls));

    setLoading(true);
    setError("");

    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      if (isRedirectError(err)) throw err;
      setError("Could not save product. Please try again.");
    } finally {
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
            <Label>
              Product images ({imageUrls.length}/{LIMITS.maxProductImages})
            </Label>
            <p className="mb-2 text-xs text-slate-500">
              First image is the catalog cover. JPEG, PNG, or WebP up to 2MB each.
            </p>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading || imageUrls.length >= LIMITS.maxProductImages}
              onChange={handleImageChange}
            />
            {uploading ? <p className="mt-2 text-sm text-slate-500">Uploading...</p> : null}
            {imageUrls.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {imageUrls.map((url, index) => (
                  <li
                    key={`${url}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-700">
                        {index === 0 ? "Cover image" : `Image ${index + 1}`}
                      </p>
                      <p className="truncate text-[11px] text-slate-500">{url}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-40"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === imageUrls.length - 1}
                        className="rounded border border-slate-200 px-2 py-0.5 text-xs disabled:opacity-40"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="rounded border border-red-200 px-2 py-0.5 text-xs text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="active"
              defaultChecked={initial?.active ?? true}
            />
            Visible in catalog
          </label>
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
