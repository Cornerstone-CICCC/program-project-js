import type { AuthCredentials, SignUpData, User } from "../models";

type AppUser = User & {
  avatar?: string;
  createdAt?: string;
};

type SignUpPayload = SignUpData & {
  confirmPassword?: string;
};

const mockUser: AppUser = {
  id: "1",
  name: "Seulgi",
  email: "seulgi@example.com",
  avatar: "👤",
  createdAt: new Date().toISOString(),
};

export const authService = {
  login: async (credentials: AuthCredentials): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email && credentials.password) {
          resolve(mockUser);
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 500);
    });
  },

  signUp: async (data: SignUpPayload): Promise<User> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (
          typeof data.confirmPassword === "string" &&
          data.password !== data.confirmPassword
        ) {
          reject(new Error("Passwords do not match"));
        } else if (!data.email || !data.password || !data.name) {
          reject(new Error("All fields are required"));
        } else {
          const newUser: AppUser = {
            id: Math.random().toString(36).slice(2, 11),
            name: data.name,
            email: data.email,
            createdAt: new Date().toISOString(),
          };

          resolve(newUser);
        }
      }, 500);
    });
  },

  logout: async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUser);
      }, 300);
    });
  },

  socialLogin: async (provider: "google" | "github"): Promise<User> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Logging in with ${provider}`);
        resolve(mockUser);
      }, 500);
    });
  },
};