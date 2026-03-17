export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  createdAt?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export type LoginInput = AuthCredentials;

export interface SignUpFormData extends AuthCredentials {
  firstName: string;
  lastName: string;
  confirmPassword: string;
}

export interface SignUpInput extends AuthCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: User;
}