// 📁 /src/app/utils/validators.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function minLength(value: string, len: number): boolean {
  return value.trim().length >= len;
}

export function isPositiveNumber(n: unknown): boolean {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

export function required(value: string): boolean {
  return value.trim().length > 0;
}