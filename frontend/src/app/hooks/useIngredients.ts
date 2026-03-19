import { useCallback, useEffect, useMemo, useState } from "react";
import type { Ingredient } from "../models/ingredient";

type IngredientApiItem = {
  _id?: string;
  id?: string;
  user_id?: string;
  name: string;
  category?: string;
  price?: number;
  store_name?: string;
  purchased_date?: string;
  expiration_date?: string;
  is_shared?: boolean;
  photo_url?: string;
};

type ApiErrorResponse = {
  message?: string;
};

type CreateIngredientInput = Omit<Ingredient, "_id">; // "_id"만 제외하고 "user_id"는 포함
type UpdateIngredientInput = Partial<Omit<Ingredient, "_id">>; // 위와 동일하게 수정

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
  // 날짜가 없거나 잘못되었을 때를 대비한 안전한 변환기
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    // 날짜 계산이 불가능한 경우(NaN) 빈 값 반환
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  return {
    _id: item._id || item.id || String(Math.random()),
    user_id: item.user_id || "",
    name: item.name || "Unknown Item", // 이름이 없으면 목록이 안 보일 수 있음
    category: item.category || "Others",
    purchased_date: formatDate(item.purchased_date), // 안전하게 변환
    expiration_date: formatDate(item.expiration_date), // 안전하게 변환
    is_shared: Boolean(item.is_shared),
    photo_url: item.photo_url || "",
    store_name: item.store_name || "My Fridge",
  };
}

function sortByExpirationDate(data: Ingredient[]) {
  return [...data].sort((a, b) => {
    const dateA = a.expiration_date || "";
    const dateB = b.expiration_date || "";
    return dateA.localeCompare(dateB);
  });
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
      if (!response.ok)
        throw new Error(getErrorMessage(data, "Failed to load ingredients"));
      const mapped = Array.isArray(data) ? data.map(mapApiIngredient) : [];
      setIngredients(sortByExpirationDate(mapped));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ingredients");
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
        name: input.name,
        category: input.category,
        price: input.price,
        store_name: input.store_name,
        purchased_date: input.purchased_date,
        expiration_date: input.expiration_date,
        is_shared: input.is_shared, // 추가
        user_id: input.user_id, // 🔴 이 줄을 추가해서 서버로 전달하세요!
      }),
    });

    const data = await parseJson<IngredientApiItem | ApiErrorResponse>(
      response,
    );
    if (!response.ok || !isIngredientApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to create ingredient"));
    }

    const newItem = mapApiIngredient(data);
    setIngredients((prev) => sortByExpirationDate([...prev, newItem]));
    return newItem;
  }, []);

  const update = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: input.name,
          category: input.category,
          price: input.price,
          store_name: input.store_name, // 🔴 수정
          purchased_date: input.purchased_date, // 🔴 수정
          expiration_date: input.expiration_date, // 🔴 수정
          is_shared: input.is_shared, // 🔴 isShared -> is_shared
        }),
      });

      const data = await parseJson<IngredientApiItem | ApiErrorResponse>(
        response,
      );
      if (!response.ok || !isIngredientApiItem(data)) {
        throw new Error(getErrorMessage(data, "Failed to update ingredient"));
      }

      const updatedItem = mapApiIngredient(data);
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
    if (!response.ok) {
      const data = await parseJson<ApiErrorResponse>(response);
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
