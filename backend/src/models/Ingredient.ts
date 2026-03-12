import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number },
    store_name: { type: String },
    purchased_date: { type: Date, required: true }, // 👈 추가: 산 날짜
    expiration_date: { type: Date, required: true },
    is_shared: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "created_at" },
  },
);

export const Ingredient = mongoose.model("Ingredient", ingredientSchema);
