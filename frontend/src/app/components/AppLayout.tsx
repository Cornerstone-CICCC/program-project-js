// src/app/components/AppLayout.tsx
import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="font-semibold">FridgeFriend</div>

          <nav className="hidden gap-4 text-sm sm:flex">
            <NavLink to="/ingredients" className={({ isActive }) => (isActive ? "font-semibold" : "text-neutral-600")}>
              Ingredients
            </NavLink>
            <NavLink to="/share" className={({ isActive }) => (isActive ? "font-semibold" : "text-neutral-600")}>
              Share
            </NavLink>
            <NavLink to="/notifications" className={({ isActive }) => (isActive ? "font-semibold" : "text-neutral-600")}>
              Notifications
            </NavLink>
            <NavLink to="/recipes" className={({ isActive }) => (isActive ? "font-semibold" : "text-neutral-600")}>
              Recipes
            </NavLink>
          </nav>

          <button
            className="rounded-md border px-3 py-1 text-sm hover:bg-neutral-50"
            onClick={() => {
              localStorage.removeItem("ff_token");
              navigate("/login", { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}