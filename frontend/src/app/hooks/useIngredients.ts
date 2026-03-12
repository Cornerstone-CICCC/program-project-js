import { useCallback, useEffect, useMemo, useState } from "react";
import type { Ingredient } from "../models/ingredient";

type CreateIngredientInput = Omit<Ingredient, "id">;
type UpdateIngredientInput = Partial<Omit<Ingredient, "id">>;

function getStorageKey() {
  const currentUserEmail = localStorage.getItem("currentUserEmail");
  return currentUserEmail
    ? `ingredients_${currentUserEmail}`
    : "ingredients_guest";
}

function readIngredients(): Ingredient[] {
  const key = getStorageKey();
  const raw = localStorage.getItem(key);

  if (!raw) return [];

  try {
    return JSON.parse(raw) as Ingredient[];
  } catch {
    return [];
  }
}

function saveIngredients(items: Ingredient[]) {
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(items));
}

function sortByExpirationDate(data: Ingredient[]) {
  return [...data].sort((a, b) => {
    const dateA =
      (a as Ingredient & { expirationDate?: string; expiration_date?: string })
        .expirationDate ||
      (a as Ingredient & { expirationDate?: string; expiration_date?: string })
        .expiration_date ||
      "";

    const dateB =
      (b as Ingredient & { expirationDate?: string; expiration_date?: string })
        .expirationDate ||
      (b as Ingredient & { expirationDate?: string; expiration_date?: string })
        .expiration_date ||
      "";

    return dateA.localeCompare(dateB);
  });
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = readIngredients();
      setIngredients(sortByExpirationDate(data));
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load ingredients";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const create = useCallback(async (input: CreateIngredientInput) => {
    const prev = readIngredients();

    const newItem: Ingredient = {
      id: Date.now(),
      ...input,
    };

    const next = sortByExpirationDate([...prev, newItem]);
    saveIngredients(next);
    setIngredients(next);

    return newItem;
  }, []);

  const update = useCallback(async (id: number, input: UpdateIngredientInput) => {
    const prev = readIngredients();

    const updatedList = prev.map((item) =>
      item.id === id ? { ...item, ...input } : item,
    );

    const updatedItem = updatedList.find((item) => item.id === id);

    if (!updatedItem) {
      throw new Error(`Ingredient with id ${id} not found`);
    }

    const sorted = sortByExpirationDate(updatedList);
    saveIngredients(sorted);
    setIngredients(sorted);

    return updatedItem;
  }, []);

  const remove = useCallback(async (id: number) => {
    const prev = readIngredients();
    const next = prev.filter((item) => item.id !== id);
    saveIngredients(next);
    setIngredients(next);
  }, []);

  return useMemo(
    () => ({
      ingredients,
      loading,
      error,
      refresh,
      create,
      update,
      remove,
    }),
    [ingredients, loading, error, refresh, create, update, remove],
  );
}