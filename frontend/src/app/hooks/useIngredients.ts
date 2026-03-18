//useIngredients.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Ingredient } from "../models/ingredient";

type IngredientApiItem = Ingredient;

type ApiErrorResponse = {
  message?: string;
};

type CreateIngredientInput = Omit<Ingredient, "_id" | "created_at">;
type UpdateIngredientInput = Partial<Omit<Ingredient, "_id" | "created_at">>;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function sortByExpirationDate(data: Ingredient[]) {
  return [...data].sort((a, b) =>
    (a.expiration_date || "").localeCompare(b.expiration_date || ""),
  );
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function isIngredientApiItem(
  data: IngredientApiItem | ApiErrorResponse | null,
): data is IngredientApiItem {
  return !!data && typeof data === "object" && "name" in data;
}

function getErrorMessage(
  data: IngredientApiItem | IngredientApiItem[] | ApiErrorResponse | null,
  fallback: string,
) {
  if (
    data &&
    !Array.isArray(data) &&
    typeof data === "object" &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
}

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await parseJson<IngredientApiItem[] | ApiErrorResponse>(
        response,
      );

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Failed to load ingredients"));
      }

      const mapped = Array.isArray(data) ? data : [];
      setIngredients(sortByExpirationDate(mapped));
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
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        user_id: input.user_id,
        name: input.name,
        category: input.category,
        price: input.price,
        store_name: input.store_name,
        purchased_date: input.purchased_date,
        expiration_date: input.expiration_date,
        is_shared: input.is_shared,
      }),
    });

    const data = await parseJson<IngredientApiItem | ApiErrorResponse>(
      response,
    );

    if (!response.ok || !isIngredientApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to create ingredient"));
    }

    const newItem = data;
    setIngredients((prev) => sortByExpirationDate([...prev, newItem]));
    return newItem;
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ...(input.user_id !== undefined ? { user_id: input.user_id } : {}),
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.category !== undefined ? { category: input.category } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.store_name !== undefined
            ? { store_name: input.store_name }
            : {}),
          ...(input.purchased_date !== undefined
            ? { purchased_date: input.purchased_date }
            : {}),
          ...(input.expiration_date !== undefined
            ? { expiration_date: input.expiration_date }
            : {}),
          ...(input.is_shared !== undefined
            ? { is_shared: input.is_shared }
            : {}),
        }),
      });

      const data = await parseJson<IngredientApiItem | ApiErrorResponse>(
        response,
      );

      if (!response.ok || !isIngredientApiItem(data)) {
        throw new Error(getErrorMessage(data, "Failed to update ingredient"));
      }

      const updatedItem = data;

      setIngredients((prev) =>
        sortByExpirationDate(
          prev.map((item) => (item._id === id ? updatedItem : item)),
        ),
      );

      return updatedItem;
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<ApiErrorResponse>(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to delete ingredient"));
    }

    setIngredients((prev) => prev.filter((item) => item._id !== id));
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