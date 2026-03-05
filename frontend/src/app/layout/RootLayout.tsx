// src/app/layout/RootLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { Home, ChefHat, Share2, MessageCircle, User } from "lucide-react";

export default function RootLayout() {
  const location = useLocation();

  const navItems = [
    { path: "/ingredients", icon: Home, label: "Home", activeOn: ["/ingredients"] },
    { path: "/recipes", icon: ChefHat, label: "Recipe", activeOn: ["/recipes"] },
    { path: "/share", icon: Share2, label: "Share", activeOn: ["/share"] },
    { path: "/chat", icon: MessageCircle, label: "Chat", activeOn: ["/chat"] },
    { path: "/notifications", icon: User, label: "My Page", activeOn: ["/notifications"] },
  ] as const;

  const isActive = (activeOn: readonly string[]) => {
    return activeOn.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.activeOn);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 ${active ? "fill-primary/20" : ""}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}