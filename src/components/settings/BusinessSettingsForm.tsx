"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBusinessSettings } from "@/lib/actions/catalog";
import { DEFAULT_CATALOG_TAGLINE } from "@/lib/constants";
import { AdminShell } from "@/components/admin/AdminNav";
import { Button, Card, Input, Label, Textarea } from "@/components/ui/Form";

interface BusinessSettingsFormProps {
  businessName: string;
  slug: string;
  catalogUrl: string;
  whatsappNumber: string;
  description: string | null;
  instagramUrl: string | null;
}

export function BusinessSettingsForm({
  businessName,
  slug,
  catalogUrl,
  whatsappNumber,
  description,
  instagramUrl,
}: BusinessSettingsFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [tagline, setTagline] = useState(description ?? "");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const result = await updateBusinessSettings(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess("Business profile updated.");
    setLoading(false);
    router.refresh();
  }

  return (
    <AdminShell title="Settings" businessName={businessName} role="admin">
      <Card className="mx-auto max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Business name</Label>
            <Input name="name" defaultValue={businessName} required maxLength={120} />
          </div>

          <div>
            <Label>Catalog URL</Label>
            <Input value={catalogUrl} readOnly disabled className="bg-slate-50" />
            <p className="mt-1 text-xs text-slate-500">
              Slug: <span className="font-mono">{slug}</span> — cannot be changed after creation.
            </p>
          </div>

          <div>
            <Label>WhatsApp number</Label>
            <Input
              name="whatsapp_number"
              defaultValue={whatsappNumber}
              required
              inputMode="tel"
              maxLength={20}
            />
          </div>

          <div>
            <Label>Catalog tagline (optional)</Label>
            <Textarea
              name="description"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={DEFAULT_CATALOG_TAGLINE}
            />
            <p className="mt-1 text-xs text-slate-500">
              Shown at the top of your public catalog. Leave blank to use our
              default, or tap below to start with a ready-made line.
            </p>
            <button
              type="button"
              onClick={() => setTagline(DEFAULT_CATALOG_TAGLINE)}
              className="mt-2 text-xs font-semibold text-brand-orange hover:underline"
            >
              Use suggested text
            </button>
          </div>

          <div>
            <Label>Instagram (optional)</Label>
            <Input
              name="instagram_url"
              defaultValue={instagramUrl ?? ""}
              maxLength={200}
              placeholder="@yourhandle or https://instagram.com/yourhandle"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>
    </AdminShell>
  );
}
