import mongoose, { Schema, Document } from "mongoose";

// 인터페이스 정의 (타입스크립트용)
export interface IRecipeLog extends Document {
  user_id: mongoose.Types.ObjectId;
  ingredients_used: string;
  generated_recipe: string;
  created_at: Date;
}

const RecipeLogSchema = new Schema(
  {
    // 누가 레시피를 만들었는지
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 사용된 재료들 (예: "양파, 감자, 스팸")
    ingredients_used: {
      type: String,
      required: true,
    },
    // AI가 생성해준 레시피 본문
    generated_recipe: {
      type: String,
      required: true,
    },
  },
  {
    // 생성 시간을 created_at으로 기록
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

export const RecipeLog = mongoose.model<IRecipeLog>(
  "RecipeLog",
  RecipeLogSchema,
);
