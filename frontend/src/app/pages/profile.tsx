//pages/profile.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MessageCircle,
  Share2,
  Bell,
  Settings,
  UserRound,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { BottomNav } from "../components/BottomNav";
import { useAuth } from "../hooks/useAuth";
import { useIngredients } from "../hooks/useIngredients";
import { useNotifications } from "../hooks/useNotifications";
import type { Notification } from "../models/notification";

export function Profile() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, error: authError, logOut } = useAuth();
  const {
    ingredients,
    loading: ingredientsLoading,
    error: ingredientsError,
  } = useIngredients();
  const {
    notifications,
    loading: notificationsLoading,
    error: notificationsError,
  } = useNotifications();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [shareNotifications, setShareNotifications] = useState(true);

  const displayName =
    user?.fullName ||
    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
    "User";

  const itemCount = ingredients.length;

  const sharedCount = useMemo(() => {
    return ingredients.filter((item) => item.is_shared).length;
  }, [ingredients]);

  const stats = [
    { id: "items", value: itemCount, label: "Items" },
    { id: "shared", value: sharedCount, label: "Shared" },
  ];

  const settingsItems = [
    {
      id: "push",
      title: "Push Notifications",
      description: "Get expiry alerts",
      icon: <Bell className="w-5 h-5 text-primary" />,
      enabled: pushNotifications,
      onToggle: () => setPushNotifications((prev) => !prev),
    },
    {
      id: "share",
      title: "Share Notifications",
      description: "When items are shared",
      icon: <Share2 className="w-5 h-5 text-primary" />,
      enabled: shareNotifications,
      onToggle: () => setShareNotifications((prev) => !prev),
    },
  ];

  const handleLogout = () => {
    logOut();
    navigate("/login");
  };

  const renderNotificationIcon = (icon: Notification["icon"]) => {
    if (icon === "calendar") {
      return (
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-red-500" />
        </div>
      );
    }

    if (icon === "chat") {
      return (
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-blue-500" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <Share2 className="w-6 h-6 text-green-500" />
      </div>
    );
  };

  if (authLoading || ingredientsLoading) {
    return (
      <div className="min-h-screen bg-[#eef9f6] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (authError || ingredientsError) {
    return (
      <div className="min-h-screen bg-[#eef9f6] flex items-center justify-center px-6">
        <p className="text-red-500 text-center">
          Failed to load profile data.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef9f6] pb-28">
      <div className="bg-white px-6 py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer rounded-full"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium">My Page</h1>
        </div>
      </div>

      <div className="bg-white px-6 py-8 border-b border-border">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#d9f3ec] flex items-center justify-center">
            <UserRound className="w-12 h-12 text-foreground" />
          </div>

          <div className="flex-1">
            <h2 className="text-4xl mb-2">{displayName}</h2>
            <p className="text-muted-foreground text-xl mb-3">
              {user?.email ?? "-"}
            </p>

            <div className="flex gap-2 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-[#d9f3ec] text-foreground text-sm">
                {sharedCount} items shared
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-3xl bg-[#f3fbf8] p-6 text-center"
            >
              <p className="text-4xl mb-2">{stat.value}</p>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium">Notifications</h2>
          <button type="button" className="cursor-pointer text-primary text-sm">
            Mark all as read
          </button>
        </div>

        <div className="space-y-4">
          {notificationsLoading ? (
            <div className="rounded-3xl bg-white border border-border p-5 text-center text-muted-foreground">
              Loading notifications...
            </div>
          ) : notificationsError ? (
            <div className="rounded-3xl bg-white border border-red-200 p-5 text-center text-red-500">
              Failed to load notifications.
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl bg-white border border-border p-5 text-center text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`rounded-3xl border p-5 ${
                  item.read
                    ? "bg-white border-border"
                    : "bg-[#f3fbf8] border-[#bfe9dc]"
                }`}
              >
                <div className="flex gap-4">
                  {renderNotificationIcon(item.icon)}

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl mb-1">{item.title}</h3>
                        <p className="text-muted-foreground">{item.message}</p>
                      </div>

                      {!item.read && (
                        <div className="w-3 h-3 rounded-full bg-primary mt-2 shrink-0" />
                      )}
                    </div>

                    <p className="text-muted-foreground mt-3">{item.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="px-6 pt-10">
        <h2 className="text-2xl font-medium mb-6">Settings</h2>

        <div className="space-y-4">
          {settingsItems.map((setting) => (
            <div
              key={setting.id}
              className="rounded-3xl bg-white border border-border p-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#d9f3ec] flex items-center justify-center">
                  {setting.icon}
                </div>
                <div>
                  <p className="text-xl">{setting.title}</p>
                  <p className="text-muted-foreground">
                    {setting.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={setting.onToggle}
                className={`cursor-pointer w-14 h-8 rounded-full relative transition-colors ${
                  setting.enabled ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                    setting.enabled ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            className="cursor-pointer w-full h-16 rounded-3xl bg-[#f3fbf8] border-[#d6ece6]"
          >
            <Settings className="w-5 h-5 mr-2" />
            More Settings
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="cursor-pointer w-full h-16 rounded-3xl border-red-300 text-red-500 hover:bg-red-50"
          >
            Log Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}