// 📁 /src/app/models/user.ts
export type UUID = string;

export type User = {
  id: UUID;
  name: string;
  email: string;
  createdAt: string; // ISO string
};

// Auth payloads (frontend <-> backend)
export type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUserResponse = {
  user: User;
};

export type AuthTokenResponse = {
  token: string; // if you use JWT
  user: User;
};