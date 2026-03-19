import mongoose, { Schema, Document } from "mongoose";

// 1. 🟢 인터페이스에 location 타입 추가
export interface ISharedPost extends Document {
  ingredient_id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  pickup_type: string;
  description?: string;
  ingredient_name?: string;
  photo_url?: string;
  status: "available" | "completed" | "canceled";
  // GeoJSON 형식 정의
  location: {
    type: "Point";
    coordinates: [number, number]; // [경도, 위도]
  };
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
    // 🟢 2. 스키마에 location 필드 추가
    location: {
      type: {
        type: String,
        enum: ["Point"], // 반드시 "Point"여야 함
        default: "Point",
      },
      coordinates: {
        type: [Number], // [경도, 위도] 순서
        required: true,
      },
    },
  },
  { timestamps: { createdAt: "created_at" } },
);

// 🟢 3. 위치 기반 검색을 위한 인덱스 생성 (중요!)
SharedPostSchema.index({ location: "2dsphere" });

export const SharedPost = mongoose.model<ISharedPost>(
  "SharedPost",
  SharedPostSchema,
);
