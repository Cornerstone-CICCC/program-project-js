// 📁 /src/app/utils/dateUtils.ts
export function toISODate(date: Date): string {
  // YYYY-MM-DD
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysUntil(dateStr: string): number {
  // dateStr: YYYY-MM-DD or ISO
  const target = new Date(dateStr);
  const now = new Date();
  // normalize to midnight
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = target.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(expirationDate: string): boolean {
  return daysUntil(expirationDate) < 0;
}

export function isExpiringSoon(expirationDate: string, thresholdDays = 3): boolean {
  const d = daysUntil(expirationDate);
  return d >= 0 && d <= thresholdDays;
}