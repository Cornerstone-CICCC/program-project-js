// 📁 /src/app/services/shareService.ts
import type { CreateSharedPostInput, SharedPost, UpdateSharedPostInput } from "../models/share";
import { apiFetch } from "./_http";

export const shareService = {
  listPublic() {
    // public board might not require auth
    return apiFetch<SharedPost[]>("/api/shared-posts", { method: "GET" });
  },
  getById(id: string) {
    return apiFetch<SharedPost>(`/api/shared-posts/${id}`, { method: "GET" });
  },
  create(input: CreateSharedPostInput, token: string) {
    return apiFetch<SharedPost>("/api/shared-posts", { method: "POST", body: input, token });
  },
  update(id: string, input: UpdateSharedPostInput, token: string) {
    return apiFetch<SharedPost>(`/api/shared-posts/${id}`, { method: "PATCH", body: input, token });
  },
  remove(id: string, token: string) {
    return apiFetch<{ ok: true }>(`/api/shared-posts/${id}`, { method: "DELETE", token });
  },
};