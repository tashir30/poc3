"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Form";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        } catch {
          setLoading(false);
        }
      }}
    >
      {loading ? "Logging out..." : "Log out"}
    </Button>
  );
}
