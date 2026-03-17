import type { AuthResponse, LoginInput, SignUpInput, User } from "../models/user";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

const TOKEN_KEY = "token";

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

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await parseJson<AuthResponse | { message?: string }>(res);

    if (!res.ok || !data || Array.isArray(data) || !("token" in data)) {
      throw new Error(getErrorMessage(data, "Login failed"));
    }

    return data;
  },

  async signUp(input: SignUpInput): Promise<{ message?: string; user: User }> {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await parseJson<
      { message?: string; user: User } | { message?: string }
    >(res);

    if (!res.ok || !data || Array.isArray(data) || !("user" in data)) {
      throw new Error(getErrorMessage(data, "Signup failed"));
    }

    return data;
  },

  async me(token?: string): Promise<{ user: User }> {
    const accessToken = token || localStorage.getItem(TOKEN_KEY);

    if (!accessToken) {
      throw new Error("Not authenticated");
    }

    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await parseJson<User | { message?: string }>(res);

    if (!res.ok || !data || Array.isArray(data) || !("email" in data)) {
      throw new Error(getErrorMessage(data, "Not authenticated"));
    }

    return { user: data };
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
};