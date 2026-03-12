// 📁 /src/app/hooks/useAuth.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { LoginInput, SignUpInput, User } from "../models/user";
import { authService } from "../services/authService";

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

const TOKEN_KEY = "ff_token";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  // bootstrap from localStorage
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }
    authService
      .me(token)
      .then((res) => setState({ user: res.user, token, isLoading: false, error: null }))
      .catch((err) =>
        setState({ user: null, token: null, isLoading: false, error: err?.message ?? "Auth error" })
      );
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const res = await authService.signUp(input);
    localStorage.setItem(TOKEN_KEY, res.token);
    setState({ user: res.user, token: res.token, isLoading: false, error: null });
    return res.user;
  }, []);

  const logIn = useCallback(async (input: LoginInput) => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    const res = await authService.logIn(input);
    localStorage.setItem(TOKEN_KEY, res.token);
    setState({ user: res.user, token: res.token, isLoading: false, error: null });
    return res.user;
  }, []);

  const logOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ user: null, token: null, isLoading: false, error: null });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthed: !!state.user && !!state.token,
      signUp,
      logIn,
      logOut,
    }),
    [state, signUp, logIn, logOut]
  );

  return value;
}