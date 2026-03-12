// 📁 /src/app/utils/formatters.ts
export function formatCurrencyCAD(amount: number): string {
  // amount가 숫자가 아니거나 없을 경우를 대비해 기본값 0 처리
  const value = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(value);
}

export function formatDateShort(dateStr: string | undefined | null): string {
  // 1. 데이터가 아예 없는 경우 빈 문자열이나 기본 메시지 반환
  if (!dateStr) return "N/A";

  const d = new Date(dateStr);

  // 2. Date 객체는 생성되었으나 유효한 날짜가 아닌 경우 (Invalid Date) 체크
  if (isNaN(d.getTime())) {
    return "Invalid Date";
  }

  return new Intl.DateTimeFormat("en-CA", { 
    year: "numeric", 
    month: "short", 
    day: "2-digit" 
  }).format(d);
}