// 📁 /src/app/services/notificationService.ts
import type { Notification, UpdateNotificationInput } from "../models/notification";
import { apiFetch } from "./_http";

export const notificationService = {
  list(token: string) {
    return apiFetch<Notification[]>("/api/notifications", { method: "GET", token });
  },
  update(id: string, input: UpdateNotificationInput, token: string) {
    return apiFetch<Notification>(`/api/notifications/${id}`, { method: "PATCH", body: input, token });
  },
  // optional: generate/refresh notifications
  // refresh(token: string) { return apiFetch<{ok:true}>("/api/notifications/refresh",{method:"POST",token}); }
};