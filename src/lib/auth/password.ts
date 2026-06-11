import "server-only";

import { randomBytes, randomInt } from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;
const TEMP_PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function validatePassword(password: string): string | null {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (trimmed.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters`;
  }
  if (!/[A-Za-z]/.test(trimmed) || !/\d/.test(trimmed)) {
    return "Password must include at least one letter and one number";
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  const error = validatePassword(password);
  if (error) {
    throw new Error(error);
  }
  return bcrypt.hash(password.trim(), SALT_ROUNDS);
}

export async function hashCredential(value: string): Promise<string> {
  return bcrypt.hash(value.trim(), SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) {
    return false;
  }
  return bcrypt.compare(password.trim(), hash);
}

export function generateTempPassword(length = 12): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    const index = randomInt(0, TEMP_PASSWORD_CHARS.length);
    result += TEMP_PASSWORD_CHARS[index];
  }
  if (!/[A-Za-z]/.test(result) || !/\d/.test(result)) {
    return `${result}a1`;
  }
  return result;
}

export function generateStaffUsername(businessSlug: string): string {
  const base = businessSlug
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8);
  const suffix = randomBytes(3).toString("hex");
  return `stf-${base || "user"}-${suffix}`;
}
