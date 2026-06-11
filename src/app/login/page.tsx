"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthShell, Button, Input, Label } from "@/components/ui/Form";
import { postJson } from "@/lib/client-api";
import { normalizePhone } from "@/lib/validation";

const REMEMBER_DEVICE_KEY = "elevo_remember_device";
const REMEMBER_PHONE_KEY = "elevo_remember_phone";

type Step = "phone" | "password" | "otp" | "set-password";
type OtpPurpose = "setup" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [step, setStep] = useState<Step>("phone");
  const [otpPurpose, setOtpPurpose] = useState<OtpPurpose>("setup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devHint, setDevHint] = useState("");

  useEffect(() => {
    try {
      const savedRemember = localStorage.getItem(REMEMBER_DEVICE_KEY) === "1";
      const savedPhone = localStorage.getItem(REMEMBER_PHONE_KEY) ?? "";
      setRememberDevice(savedRemember);
      if (savedRemember && savedPhone) setPhone(savedPhone);
    } catch {
      // Ignore storage errors.
    }
  }, []);

  function persistRemember(remember: boolean, savedPhone: string) {
    try {
      if (remember && savedPhone) {
        localStorage.setItem(REMEMBER_DEVICE_KEY, "1");
        localStorage.setItem(REMEMBER_PHONE_KEY, savedPhone);
      } else {
        localStorage.removeItem(REMEMBER_DEVICE_KEY);
        localStorage.removeItem(REMEMBER_PHONE_KEY);
      }
    } catch {
      // Ignore storage errors.
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setLoading(false);
      setError("Enter a valid mobile number (8–20 digits).");
      return;
    }

    const { ok, errorMessage } = await postJson("/api/auth/lookup", {
      phone: normalizedPhone,
    });

    setLoading(false);

    if (!ok) {
      setError(errorMessage || "Unable to continue");
      return;
    }

    setPhone(normalizedPhone);
    setStep("password");
  }

  async function sendOtp(purpose: OtpPurpose) {
    setLoading(true);
    setError("");
    setDevHint("");
    setOtpPurpose(purpose);

    const otpRes = await postJson<{ message?: string }>("/api/auth/send-otp", {
      phone: normalizePhone(phone),
      purpose,
    });
    setLoading(false);

    if (!otpRes.ok) {
      setError(otpRes.errorMessage || "Failed to send OTP");
      return;
    }

    setDevHint(
      otpRes.data.message ??
        (purpose === "reset"
          ? "Enter the OTP sent to your phone"
          : "Enter the OTP sent to your phone"),
    );
    setOtp("");
    setStep("otp");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { ok, errorMessage } = await postJson("/api/auth/login", {
      phone: normalizePhone(phone),
      password,
      remember: rememberDevice,
    });

    setLoading(false);
    if (!ok) {
      setError(errorMessage || "Invalid credentials");
      return;
    }

    persistRemember(rememberDevice, phone);
    router.push("/dashboard");
    router.refresh();
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { ok, data, errorMessage } = await postJson<{
      needsPassword?: boolean;
      purpose?: OtpPurpose;
    }>("/api/auth/verify-otp", {
      phone: normalizePhone(phone),
      otp,
      purpose: otpPurpose,
    });

    setLoading(false);
    if (!ok) {
      setError(errorMessage || "Invalid OTP");
      return;
    }

    if (data.needsPassword) {
      setStep("set-password");
      return;
    }

    setError("Unable to complete sign in. Try again.");
  }

  async function handleSetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { ok, data, errorMessage } = await postJson<{
      redirect?: "dashboard" | "onboarding";
    }>("/api/auth/set-password", {
      password: newPassword,
      remember: rememberDevice,
    });

    setLoading(false);
    if (!ok) {
      setError(errorMessage || "Could not set password");
      return;
    }

    persistRemember(rememberDevice, phone);
    router.push(data.redirect === "dashboard" ? "/dashboard" : "/onboarding");
    router.refresh();
  }

  const isResetFlow = otpPurpose === "reset";

  return (
    <AuthShell
      title="Merchant sign in"
      subtitle="Use your mobile number to manage your Elevo catalog"
    >
      <p className="mb-4 text-center text-xs text-slate-500">
        Staff member?{" "}
        <Link href="/staff-login" className="font-semibold text-brand-orange hover:underline">
          Staff login
        </Link>
      </p>

      {step === "phone" ? (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <Label>Mobile number</Label>
            <Input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </Button>
        </form>
      ) : null}

      {step === "password" ? (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="text-right">
            <button
              type="button"
              onClick={() => sendOtp("reset")}
              disabled={loading}
              className="text-xs font-semibold text-brand-orange hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            Remember this device
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            disabled={loading}
            onClick={() => sendOtp("setup")}
          >
            First time? Verify with OTP
          </Button>
          <Button type="button" variant="secondary" fullWidth onClick={() => setStep("phone")}>
            Change number
          </Button>
        </form>
      ) : null}

      {step === "otp" ? (
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <p className="text-center text-sm text-slate-600">
            {isResetFlow
              ? "Enter the OTP to reset your password"
              : "Enter the OTP to verify your number"}
          </p>
          <div>
            <Label>Enter OTP</Label>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
            />
            {devHint ? <p className="mt-2 text-xs text-amber-700">{devHint}</p> : null}
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={() => {
              setError("");
              setDevHint("");
              setStep("password");
            }}
          >
            Back
          </Button>
        </form>
      ) : null}

      {step === "set-password" ? (
        <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
          <div>
            <Label>{isResetFlow ? "New password" : "Create password"}</Label>
            <Input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              At least 8 characters with a letter and a number
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
            />
            Remember this device
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" fullWidth disabled={loading}>
            {loading
              ? "Saving..."
              : isResetFlow
                ? "Reset password & sign in"
                : "Set password & continue"}
          </Button>
        </form>
      ) : null}
    </AuthShell>
  );
}
