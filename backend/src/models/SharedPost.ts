import mongoose, { Schema } from "mongoose";

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

export const SharedPost = mongoose.model("SharedPost", SharedPostSchema);
