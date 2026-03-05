// 📁 /src/app/models/recipe.ts
import type { UUID } from "./user";

export type RecipeLog = {
  id: UUID;
  userId: UUID;
  ingredientsUsed: string; // free text or comma-separated
  generatedRecipe: string; // generated text
  createdAt: string;
};

export type GenerateRecipeInput = {
  ingredientsUsed: string;
};

export type GenerateRecipeResponse = {
  generatedRecipe: string;
};

export type CreateRecipeLogInput = {
  ingredientsUsed: string;
  generatedRecipe: string;
};