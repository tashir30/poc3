"use client";

import { useState } from "react";
import { createBusiness } from "@/lib/actions/catalog";
import { slugify } from "@/lib/validation";
import { AuthShell, Button, Input, Label } from "@/components/ui/Form";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(value));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createBusiness(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create catalog"
      subtitle="Set up your business in under 2 minutes"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Business name</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="ABC Sports"
            required
          />
        </div>
        <div>
          <Label>WhatsApp number</Label>
          <Input
            name="whatsapp_number"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="919876543210"
            required
          />
        </div>
        <div>
          <Label>Catalog URL</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">/</span>
            <Input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Creating..." : "Create catalog"}
        </Button>
      </form>
    </AuthShell>
  );
}
