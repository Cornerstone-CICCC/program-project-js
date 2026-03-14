//useIngredients.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Ingredient } from "../models/ingredient";

type IngredientApiItem = {
  _id: string;
  name: string;
  category?: string;
  price?: number;
  store_name?: string;
  purchased_date?: string;
  expiration_date?: string;
  is_shared?: boolean;
};

type CreateIngredientInput = Omit<Ingredient, "id">;
type UpdateIngredientInput = Partial<Omit<Ingredient, "id">>;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatExpiry(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dateString?: string) {
  if (!dateString) return 0;

  const today = new Date();
  const expiry = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getStatus(daysLeft: number): "fresh" | "expiring" | "expired" {
  if (daysLeft < 0) return "expired";
  if (daysLeft < 3) return "expiring";
  return "fresh";
}

function getCategoryImage(category?: string) {
  const normalized = (category || "").toLowerCase();

  if (normalized.includes("vegetable")) return "🥬";
  if (normalized.includes("fruit")) return "🍎";
  if (normalized.includes("dairy")) return "🥛";
  if (normalized.includes("meat")) return "🍖";
  if (normalized.includes("seafood")) return "🐟";
  if (normalized.includes("grain")) return "🌾";
  return "📦";
}

function mapApiIngredient(item: IngredientApiItem): Ingredient {
  const expirationDate = item.expiration_date
    ? new Date(item.expiration_date).toISOString().slice(0, 10)
    : "";

  const buyDate = item.purchased_date
    ? new Date(item.purchased_date).toISOString().slice(0, 10)
    : "";

  const daysLeft = getDaysLeft(expirationDate);

  return {
    id: item._id,
    name: item.name,
    category: item.category || "Other",
    expiry: formatExpiry(expirationDate),
    daysLeft,
    status: getStatus(daysLeft),
    image: getCategoryImage(item.category),
    checked: false,
    buyDate,
    expirationDate,
    storeName: item.store_name || "My Fridge",
  };
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

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
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

      const data = await parseJson<IngredientApiItem[] | { message?: string }>(
        response,
      );

      if (!response.ok) {
        const message =
          data &&
          !Array.isArray(data) &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to load ingredients";
        throw new Error(message);
      }

      const mapped = Array.isArray(data) ? data.map(mapApiIngredient) : [];
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
    const expirationDate =
      (input as Ingredient & {
        expirationDate?: string;
        expiration_date?: string;
      }).expirationDate ||
      (input as Ingredient & {
        expirationDate?: string;
        expiration_date?: string;
      }).expiration_date;

    const buyDate = (input as Ingredient & { buyDate?: string }).buyDate;

    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: input.name,
        store_name:
          (input as Ingredient & { storeName?: string }).storeName ||
          "My Fridge",
        purchased_date: buyDate,
        expiration_date: expirationDate,
      }),
    });

    const data = await parseJson<IngredientApiItem | { message?: string }>(
      response,
    );

    if (!response.ok || !data || Array.isArray(data)) {
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Failed to create ingredient";
      throw new Error(message);
    }

    const newItem = mapApiIngredient(data as IngredientApiItem);
    setIngredients((prev) => sortByExpirationDate([...prev, newItem]));
    return newItem;
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      const expirationDate =
        (input as Ingredient & {
          expirationDate?: string;
          expiration_date?: string;
        }).expirationDate ||
        (input as Ingredient & {
          expirationDate?: string;
          expiration_date?: string;
        }).expiration_date;

      const buyDate = (input as Ingredient & { buyDate?: string }).buyDate;

      const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: input.name,
          category: input.category,
          store_name: (input as Ingredient & { storeName?: string }).storeName,
          purchased_date: buyDate,
          expiration_date: expirationDate,
        }),
      });

      const data = await parseJson<IngredientApiItem | { message?: string }>(
        response,
      );

      if (!response.ok || !data || Array.isArray(data)) {
        const message =
          data &&
          typeof data === "object" &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Failed to update ingredient";
        throw new Error(message);
      }

      const updatedItem = mapApiIngredient(data as IngredientApiItem);

      setIngredients((prev) =>
        sortByExpirationDate(
          prev.map((item) => (item.id === id ? updatedItem : item)),
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

    const data = await parseJson<{ message?: string }>(response);

    if (!response.ok) {
      const message =
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Failed to delete ingredient";
      throw new Error(message);
    }

    setIngredients((prev) => prev.filter((item) => item.id !== id));
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