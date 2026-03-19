import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    category: { type: String, default: "Others" }, // 👈 추가: 자동 분류 카테고리
    price: { type: Number },
    store_name: { type: String },
    purchased_date: { type: Date, required: true },
    expiration_date: { type: Date, required: true },
    is_shared: { type: Boolean, default: false },
    photo_url: { type: String }, // 👈 이 줄을 추가하세요!
  },
  {
    timestamps: { createdAt: "created_at" },
  },
);

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
