"use client";

import { Button } from "@/components/ui/Form";

export function LogoutButton() {
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        window.location.href = "/login";
      }}
    >
      Log out
    </Button>
  );
}
