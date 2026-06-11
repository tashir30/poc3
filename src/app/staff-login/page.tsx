"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, Button, Input, Label } from "@/components/ui/Form";
import { postJson } from "@/lib/client-api";

export default function StaffLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { ok, errorMessage } = await postJson("/api/auth/staff-login", {
      username: username.trim(),
      password,
    });

    setLoading(false);
    if (!ok) {
      setError(errorMessage || "Invalid credentials");
      return;
    }

    router.push("/inventory");
    router.refresh();
  }

  return (
    <AuthShell title="Staff login" subtitle="Use the username and password from your employer">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-500">
        Business owner?{" "}
        <Link href="/login" className="font-semibold text-brand-orange hover:underline">
          Merchant login
        </Link>
      </p>
    </AuthShell>
  );
}
