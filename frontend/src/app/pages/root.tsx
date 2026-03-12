import { Outlet, Link, useLocation } from "react-router";
import { Home, ChefHat, Share2, MessageCircle, User } from "lucide-react";
import { BottomNav } from "../components/BottomNav";

export function Root() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/recipe-generator", icon: ChefHat, label: "Recipe" },
    { path: "/share-board", icon: Share2, label: "Share" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/notifications", icon: User, label: "My Page" },
  ];

  return (
    <div className="min-h-screen bg-background pb-28 flex flex-col max-w-md mx-auto">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <BottomNav />
    </div>
  );
}