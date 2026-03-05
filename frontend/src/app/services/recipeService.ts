// 📁 /src/app/services/recipeService.ts
import type {
  CreateRecipeLogInput,
  GenerateRecipeInput,
  GenerateRecipeResponse,
  RecipeLog,
} from "../models/recipe";
import { apiFetch } from "./_http";

export const recipeService = {
  generate(input: GenerateRecipeInput, token: string) {
    return apiFetch<GenerateRecipeResponse>("/api/recipes/generate", { method: "POST", body: input, token });
  },
  listLogs(token: string) {
    return apiFetch<RecipeLog[]>("/api/recipe-logs", { method: "GET", token });
  },
  createLog(input: CreateRecipeLogInput, token: string) {
    return apiFetch<RecipeLog>("/api/recipe-logs", { method: "POST", body: input, token });
  },
};