import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  CreateIngredientInput,
  Ingredient,
  UpdateIngredientInput,
} from "../models/ingredient";
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
      // 백엔드에서 온 snake_case를 프론트에서 쓰는 expirationDate로 안전하게 정렬
      const sorted = [...data].sort((a, b) => {
        const dateA = a.expirationDate || (a as any).expiration_date || "";
        const dateB = b.expirationDate || (b as any).expiration_date || "";
        return dateA.localeCompare(dateB);
      });
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

      // ⭐ 백엔드가 요구하는 Snake Case로 데이터 매핑
      // 타입 에러를 피하기 위해 백엔드 구조를 명시적으로 생성
      const backendPayload = {
        name: input.name,
        price: input.price,
        store_name: (input as any).storeName || (input as any).store_name,
        expiration_date:
          (input as any).expirationDate || (input as any).expiration_date,
        is_shared: (input as any).isShared || (input as any).is_shared || false,
      };

      // 서비스 호출 시 변환된 데이터를 보냄
      const created = await ingredientService.create(
        backendPayload as any,
        token,
      );

      setItems((prev) =>
        [...prev, created].sort((a, b) => {
          const dateA = a.expirationDate || (a as any).expiration_date || "";
          const dateB = b.expirationDate || (b as any).expiration_date || "";
          return dateA.localeCompare(dateB);
        }),
      );
      return created;
    },
    [token],
  );

  const update = useCallback(
    async (id: string, input: UpdateIngredientInput) => {
      if (!token) throw new Error("Not authenticated");

      // 업데이트 시에도 Snake Case 변환이 필요한 경우 처리
      const backendPayload = {
        ...input,
        ...((input as any).storeName && {
          store_name: (input as any).storeName,
        }),
        ...((input as any).expirationDate && {
          expiration_date: (input as any).expirationDate,
        }),
        ...((input as any).isShared !== undefined && {
          is_shared: (input as any).isShared,
        }),
      };

      const updated = await ingredientService.update(
        id,
        backendPayload as any,
        token,
      );
      setItems((prev) =>
        prev
          .map((x) => (x.id === id ? updated : x))
          .sort((a, b) => {
            const dateA = a.expirationDate || (a as any).expiration_date || "";
            const dateB = b.expirationDate || (b as any).expiration_date || "";
            return dateA.localeCompare(dateB);
          }),
      );
      return updated;
    },
    [token],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Not authenticated");
      await ingredientService.remove(id, token);
      setItems((prev) => prev.filter((x) => x.id !== id));
    },
    [token],
  );

  const value = useMemo(
    () => ({ items, isLoading, error, refresh, create, update, remove }),
    [items, isLoading, error, refresh, create, update, remove],
  );

  return value;
}
