//src/app/services/ingredientService.ts
import type { Ingredient } from "../models";

type IngredientApiItem = {
  _id?: string;
  id?: string;
  name: string;
  category?: string;
  price?: number;
  store_name?: string;
  purchased_date?: string;
  expiration_date?: string;
  is_shared?: boolean;
};

type ApiErrorResponse = {
  message?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function getAuthHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

function getErrorMessage(data: unknown, fallback: string) {
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message?: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }

  return fallback;
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
    id: item._id || item.id || "",
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
    isShared: Boolean(item.is_shared),
  };
}

function mapIngredientToApiPayload(input: Partial<Ingredient>) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.storeName !== undefined ? { store_name: input.storeName } : {}),
    ...(input.buyDate !== undefined ? { purchased_date: input.buyDate } : {}),
    ...(input.expirationDate !== undefined
      ? { expiration_date: input.expirationDate }
      : {}),
    ...(input.isShared !== undefined ? { is_shared: input.isShared } : {}),
  };
}

function isIngredientApiItem(data: unknown): data is IngredientApiItem {
  return !!data && typeof data === "object" && "name" in data;
}

export const ingredientService = {
  async getAll(): Promise<Ingredient[]> {
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<IngredientApiItem[] | ApiErrorResponse>(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load ingredients"));
    }

    return Array.isArray(data) ? data.map(mapApiIngredient) : [];
  },

  async getById(id: string): Promise<Ingredient | undefined> {
    const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<IngredientApiItem | ApiErrorResponse>(response);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to load ingredient"));
    }

    return isIngredientApiItem(data) ? mapApiIngredient(data) : undefined;
  },

  async add(ingredient: Omit<Ingredient, "id">): Promise<Ingredient> {
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(
        mapIngredientToApiPayload({
          name: ingredient.name,
          category: ingredient.category,
          storeName: ingredient.storeName || "My Fridge",
          buyDate: ingredient.buyDate,
          expirationDate: ingredient.expirationDate,
          isShared: ingredient.isShared,
        }),
      ),
    });

    const data = await parseJson<IngredientApiItem | ApiErrorResponse>(response);

    if (!response.ok || !isIngredientApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to create ingredient"));
    }

    return mapApiIngredient(data);
  },

  async update(
    id: string,
    updates: Partial<Ingredient>,
  ): Promise<Ingredient | undefined> {
    const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(mapIngredientToApiPayload(updates)),
    });

    const data = await parseJson<IngredientApiItem | ApiErrorResponse>(response);

    if (response.status === 404) {
      return undefined;
    }

    if (!response.ok || !isIngredientApiItem(data)) {
      throw new Error(getErrorMessage(data, "Failed to update ingredient"));
    }

    return mapApiIngredient(data);
  },

  async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/api/ingredients/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await parseJson<ApiErrorResponse>(response);

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(data, "Failed to delete ingredient"));
    }

    return true;
  },

  async getExpiringSoon(days = 7): Promise<Ingredient[]> {
    const allIngredients = await this.getAll();
    return allIngredients.filter((item) => item.daysLeft <= days);
  },

  async toggleChecked(id: string): Promise<Ingredient | undefined> {
    const ingredient = await this.getById(id);

    if (!ingredient) {
      return undefined;
    }

    return this.update(id, {
      checked: !ingredient.checked,
    });
  },
};