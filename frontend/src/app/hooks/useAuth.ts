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

const TOKEN_KEY = "token";

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

    if (!token) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
      return;
    }

    authService
      .me(token)
      .then((res) =>
        setState({
          user: res.user,
          token,
          isLoading: false,
          error: null,
        }),
      )
      .catch((err) => {
        localStorage.removeItem(TOKEN_KEY);

        setState({
          user: null,
          token: null,
          isLoading: false,
          error: err instanceof Error ? err.message : "Auth error",
        });
      });
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await authService.signUp(input);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      return res.user;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Signup failed";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));

      throw error;
    }
  }, []);

  const logIn = useCallback(async (input: LoginInput) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const res = await authService.login(input);

      localStorage.setItem(TOKEN_KEY, res.token);

      setState({
        user: res.user,
        token: res.token,
        isLoading: false,
        error: null,
      });

      return res.user;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Login failed";

      setState({
        user: null,
        token: null,
        isLoading: false,
        error: message,
      });

      throw error;
    }
  }, []);

  const logOut = useCallback(() => {
    authService.logout();

    setState({
      user: null,
      token: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      isAuthed: !!state.user && !!state.token,
      signUp,
      logIn,
      logOut,
    }),
    [state, signUp, logIn, logOut],
  );

  return value;
}