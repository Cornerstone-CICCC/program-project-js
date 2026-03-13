import mongoose, { Schema, Document } from "mongoose";

export interface IRecipeLog extends Document {
  user_id: mongoose.Types.ObjectId;
  ingredients_used: string;
  generated_recipe: string;
  created_at: Date;
}

const RecipeLogSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ingredients_used: {
      type: String,
      required: true,
    },
    generated_recipe: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

export const RecipeLog = mongoose.model<IRecipeLog>(
  "RecipeLog",
  RecipeLogSchema,
);
