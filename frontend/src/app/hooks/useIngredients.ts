// 📁 /src/app/hooks/useIngredients.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CreateIngredientInput, Ingredient, UpdateIngredientInput } from "../models/ingredient";
import { ingredientService } from "../services/ingredientService";

export function useIngredients(token: string | null) {
  const [items, setItems] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ingredientService.list(token);
      // Sort by expiration_date ascending
      const sorted = [...data].sort((a, b) => a.expirationDate.localeCompare(b.expirationDate));
      setItems(sorted);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load ingredients");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (input: CreateIngredientInput) => {
      if (!token) throw new Error("Not authenticated");
      const created = await ingredientService.create(input, token);
      setItems((prev) => [...prev, created].sort((a, b) => a.expirationDate.localeCompare(b.expirationDate)));
      return created;
    },
    [token]
  );

  const update = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      if (!token) throw new Error("Not authenticated");
      const updated = await ingredientService.update(id, input, token);
      setItems((prev) =>
        prev.map((x) => (x.id === id ? updated : x)).sort((a, b) => a.expirationDate.localeCompare(b.expirationDate))
      );
      return updated;
    },
    [token]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      await ingredientService.remove(id, token);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
    [token]
  );

  const value = useMemo(
    () => ({ items, isLoading, error, refresh, create, update, remove }),
    [items, isLoading, error, refresh, create, update, remove]
  );

  return value;
}