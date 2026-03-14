//BottomNav.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, ChefHat, Share2, MessageCircle, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/ingredients",
    },
    {
      label: "Recipe",
      icon: ChefHat,
      path: "/recipes",
    },
    {
      label: "Share",
      icon: Share2,
      path: "/share",
    },
    {
      label: "Chat",
      icon: MessageCircle,
      path: "/chat",
    },
    {
      label: "My Page",
      icon: User,
      path: "/profile",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="flex justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center text-xs transition-colors ${
                isActive
                  ? "text-[#1d7d5e]"
                  : "text-muted-foreground hover:text-[#1d7d5e]"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-1 ${
                  isActive ? "text-[#1d7d5e]" : ""
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}