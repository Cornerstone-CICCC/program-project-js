import { Link, useLocation } from "react-router-dom";
import {
  House,
  ChefHat,
  Share2,
  MessageCircle,
  UserRound,
} from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      to: "/ingredients",
      label: "Home",
      icon: House,
    },
    {
      to: "/recipes",
      label: "Recipe",
      icon: ChefHat,
    },
    {
      to: "/share",
      label: "Share",
      icon: Share2,
    },
    {
      to: "/chat",
      label: "Chat",
      icon: MessageCircle,
    },
    {
      to: "/profile",
      label: "My Page",
      icon: UserRound,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="grid grid-cols-5 h-20">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}