//authService.ts
type AuthCredentials = {
  email: string;
  password: string;
};

type LoginResponse = {
  message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
  };
};

type SignUpPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

type SignUpResponse = {
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email: string;
  };
};

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:4000";

async function parseResponse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "Request failed.";
    throw new Error(message);
  }

  return data as T;
}

export const authService = {
  login: async (credentials: AuthCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    return parseResponse<LoginResponse>(response);
  },

  signUp: async (data: SignUpPayload): Promise<SignUpResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      }),
    });

    return parseResponse<SignUpResponse>(response);
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem("token");

    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return parseResponse(response);
  },
};