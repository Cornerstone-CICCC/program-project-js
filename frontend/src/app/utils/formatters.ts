// 📁 /src/app/utils/formatters.ts
export function formatCurrencyCAD(amount: number): string {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "2-digit" }).format(d);
}