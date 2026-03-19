export interface SharedItem {
  _id: string; // id ❌ -> _id ⭕ (string)
  ingredient_id: string;
  user_id: {
    // populate된 경우 객체, 아니면 string
    _id: string;
    name: string;
  };
  ingredient_name: string; // name ❌ -> ingredient_name ⭕
  pickup_type: string; // type ❌ -> pickup_type ⭕
  description?: string;
  photo_url?: string; // image ❌ -> photo_url ⭕
  status: "available" | "completed" | "canceled";
  created_at: string; // createdAt ❌ -> created_at ⭕

  // 기존 UI용 가상 필드 (필요시 유지)
  location?: string;
  distance?: string;
}
