import mongoose, { Schema, Document } from "mongoose";

// 1. 🔴 인터페이스 추가 (이게 없으면 컨트롤러에서 'description'에 빨간줄이 생깁니다)
export interface ISharedPost extends Document {
  ingredient_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  pickup_type: string;
  description?: string; // 추가
  ingredient_name?: string; // 추가
  photo_url?: string;
  status: "available" | "completed" | "canceled";
  created_at: Date;
}

const SharedPostSchema = new Schema(
  {
    ingredient_id: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    pickup_type: {
      type: String,
      required: true,
    },
    // 2. 🟢 스키마에도 실제 필드 추가
    description: {
      type: String,
      default: "",
    },
    ingredient_name: {
      type: String,
      default: "",
    },
    photo_url: {
      type: String,
    },
    status: {
      type: String,
      enum: ["available", "completed", "canceled"],
      default: "available",
    },
  },
  { timestamps: { createdAt: "created_at" } },
);

// 3. 🔴 모델 생성 시 <ISharedPost> 타입을 연결해줍니다.
export const SharedPost = mongoose.model<ISharedPost>(
  "SharedPost",
  SharedPostSchema,
);
