"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Form";

interface SubmitButtonProps {
  children: React.ReactNode;
  pendingLabel: string;
  fullWidth?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

export function SubmitButton({
  children,
  pendingLabel,
  fullWidth,
  variant = "primary",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      fullWidth={fullWidth}
      variant={variant}
      disabled={pending}
      className={className}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
