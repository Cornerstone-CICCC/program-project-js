export interface Ingredient {
  _id: string; // MongoDB는 id 대신 _id를 사용 (string)
  user_id: string; // 소유자 ID
  name: string; // 재료 이름
  category: string; // 카테고리 (기본값 "Others")
  price?: number; // 가격
  store_name?: string; // 구매처
  purchased_date: string; // 백엔드 기준 (Date string)
  expiration_date: string; // 백엔드 기준 (Date string)
  is_shared: boolean; // 나눔 여부
  created_at?: string; // 생성 시간
}
