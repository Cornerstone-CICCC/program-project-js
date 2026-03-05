// 📁 /src/app/services/ingredientService.ts
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../models/ingredient";
import { apiFetch } from "./_http";

export const ingredientService = {
  list(token: string) {
    return apiFetch<Ingredient[]>("/api/ingredients", { method: "GET", token });
  },
  getById(id: string, token: string) {
    return apiFetch<Ingredient>(`/api/ingredients/${id}`, { method: "GET", token });
  },
  create(input: CreateIngredientInput, token: string) {
    return apiFetch<Ingredient>("/api/ingredients", { method: "POST", body: input, token });
  },
  update(id: string, input: UpdateIngredientInput, token: string) {
    return apiFetch<Ingredient>(`/api/ingredients/${id}`, { method: "PATCH", body: input, token });
  },
  remove(id: string, token: string) {
    return apiFetch<{ ok: true }>(`/api/ingredients/${id}`, { method: "DELETE", token });
  },
};