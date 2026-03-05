// 📁 /src/app/services/authService.ts
import type { AuthTokenResponse, AuthUserResponse, LoginInput, SignUpInput } from "../models/user";
import { apiFetch } from "./_http";

// Adjust endpoints to match your backend.
export const authService = {
  signUp(input: SignUpInput) {
    return apiFetch<AuthTokenResponse>("/api/auth/signup", { method: "POST", body: input });
  },
  logIn(input: LoginInput) {
    return apiFetch<AuthTokenResponse>("/api/auth/login", { method: "POST", body: input });
  },
  me(token: string) {
    return apiFetch<AuthUserResponse>("/api/auth/me", { method: "GET", token });
  },
  // socialLogin(provider: "google" | "github") { ... } // optional
};