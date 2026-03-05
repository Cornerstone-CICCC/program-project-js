// src/app/components/RequireAuth.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("ff_token"); // useAuth 연결 전 임시
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}