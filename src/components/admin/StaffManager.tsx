"use client";

import { useState, useTransition } from "react";
import type { StaffAccount } from "@/types/database";
import { Button, Card, Input, Label } from "@/components/ui/Form";
import {
  createStaffAccount,
  deleteStaffMember,
  resetStaffMemberPassword,
  setStaffStatus,
} from "@/lib/actions/staff";

interface StaffManagerProps {
  staff: StaffAccount[];
  maxStaff: number;
  activeCount: number;
}

export function StaffManager({ staff, maxStaff, activeCount }: StaffManagerProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<{
    username: string;
    whatsappUrl: string;
  } | null>(null);

  function handleCreate(formData: FormData) {
    setError("");
    setCredentials(null);
    startTransition(async () => {
      const result = await createStaffAccount(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.ok && result.username && result.whatsappUrl) {
        setCredentials({
          username: result.username,
          whatsappUrl: result.whatsappUrl,
        });
        window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    });
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <p className="text-xs text-slate-500">
          {activeCount} / {maxStaff} active staff on your plan
        </p>
        <form action={handleCreate} className="mt-3 space-y-3">
          <div>
            <Label>Staff name</Label>
            <Input name="name" required placeholder="Ravi" />
          </div>
          <div>
            <Label>Contact phone (for sending credentials)</Label>
            <Input name="contact_phone" type="tel" required placeholder="9876543210" />
          </div>
          <Button type="submit" fullWidth disabled={pending}>
            {pending ? "Creating..." : "Create staff login"}
          </Button>
        </form>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {credentials ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <p className="font-semibold text-emerald-900">Staff login created</p>
            <p className="mt-2">
              Username: <strong>{credentials.username}</strong>
            </p>
            <p className="mt-1 text-emerald-800">
              Open WhatsApp to send the one-time password to your staff member.
            </p>
            <a
              href={credentials.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-semibold text-emerald-800 hover:underline"
            >
              Send via WhatsApp →
            </a>
          </div>
        ) : null}
      </Card>

      <div className="space-y-2">
        {staff.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display font-semibold uppercase text-brand-navy">
                  {member.name}
                </p>
                <p className="text-sm text-slate-600">@{member.username}</p>
                <p className="text-xs text-slate-500">{member.contact_phone}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                  member.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {member.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.status === "active" ? (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => setStaffStatus(member.id, "inactive"))
                  }
                  className="text-xs font-semibold text-slate-600 hover:text-brand-orange"
                >
                  Deactivate
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(() => setStaffStatus(member.id, "active"))
                  }
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Activate
                </button>
              )}
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await resetStaffMemberPassword(member.id);
                    if (result.ok && result.whatsappUrl) {
                      setCredentials({
                        username: member.username,
                        whatsappUrl: result.whatsappUrl,
                      });
                      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
                    }
                  })
                }
                className="text-xs font-semibold text-slate-600 hover:text-brand-orange"
              >
                Reset password
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => deleteStaffMember(member.id))
                }
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
