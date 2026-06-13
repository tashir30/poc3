"use client";

import { useFormStatus } from "react-dom";

interface DeleteSubmitButtonProps {
  label?: string;
  pendingLabel?: string;
}

export function DeleteSubmitButton({
  label = "Delete",
  pendingLabel = "Deleting...",
}: DeleteSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm font-bold uppercase tracking-wide text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
