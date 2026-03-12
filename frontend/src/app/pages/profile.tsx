import { useState } from "react";
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

export function Profile() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("currentUserName") || "User";
  const userEmail = localStorage.getItem("currentUserEmail") || "-";

  const [pushNotifications, setPushNotifications] = useState(true);
  const [shareNotifications, setShareNotifications] = useState(true);

  const notifications = [
    {
      id: 1,
      title: "Milk expires in 2 days",
      description: "Seoul Milk 500ml will expire on Apr 25",
      time: "1h ago",
      icon: "calendar",
      unread: true,
    },
    {
      id: 2,
      title: "New message!",
      description: "Minho Kim sent you a message",
      time: "3h ago",
      icon: "chat",
      unread: true,
    },
    {
      id: 3,
      title: "Item shared with you!",
      description: "Sora shared Carrots with you",
      time: "5h ago",
      icon: "share",
      unread: false,
    },
    {
      id: 4,
      title: "3 items expiring soon",
      description: "Check your fridge for expiring items",
      time: "Yesterday",
      icon: "calendar",
      unread: false,
    },
    {
      id: 5,
      title: "Pickup confirmed",
      description: "Jiyeon confirmed pickup at 6pm",
      time: "Yesterday",
      icon: "chat",
      unread: false,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("currentUserEmail");
    localStorage.removeItem("currentUserName");
    navigate("/login");
  };

  const renderNotificationIcon = (icon: string) => {
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

  return (
    <div className="min-h-screen bg-[#eef9f6] pb-28">
      {/* Header */}
      <div className="bg-white px-6 py-5 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-medium">My Page</h1>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="bg-white px-6 py-8 border-b border-border">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-full bg-[#d9f3ec] flex items-center justify-center">
            <UserRound className="w-12 h-12 text-foreground" />
          </div>

          <div className="flex-1">
            <h2 className="text-4xl mb-2">{userName}</h2>
            <p className="text-muted-foreground text-xl mb-3">{userEmail}</p>

            <div className="flex gap-2 flex-wrap">
              <span className="px-4 py-2 rounded-full bg-[#d9f3ec] text-primary text-sm">
                Level 5
              </span>
              <span className="px-4 py-2 rounded-full bg-[#d9f3ec] text-foreground text-sm">
                128 items shared
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-3xl bg-[#f3fbf8] p-6 text-center">
            <p className="text-4xl mb-2">42</p>
            <p className="text-muted-foreground">Items</p>
          </div>

          <div className="rounded-3xl bg-[#f3fbf8] p-6 text-center">
            <p className="text-4xl mb-2">15</p>
            <p className="text-muted-foreground">Shared</p>
          </div>

          <div className="rounded-3xl bg-[#f3fbf8] p-6 text-center">
            <p className="text-4xl mb-2">28</p>
            <p className="text-muted-foreground">Saved</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-medium">Notifications</h2>
          <button className="text-primary text-sm">Mark all as read</button>
        </div>

        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl border p-5 ${
                item.unread
                  ? "bg-[#f3fbf8] border-[#bfe9dc]"
                  : "bg-white border-border"
              }`}
            >
              <div className="flex gap-4">
                {renderNotificationIcon(item.icon)}

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl mb-1">{item.title}</h3>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>

                    {item.unread && (
                      <div className="w-3 h-3 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                  </div>

                  <p className="text-muted-foreground mt-3">{item.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 pt-10">
        <h2 className="text-2xl font-medium mb-6">Settings</h2>

        <div className="space-y-4">
          <div className="rounded-3xl bg-white border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#d9f3ec] flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl">Push Notifications</p>
                <p className="text-muted-foreground">Get expiry alerts</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPushNotifications((prev) => !prev)}
              className={`w-14 h-8 rounded-full relative transition-colors ${
                pushNotifications ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  pushNotifications ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="rounded-3xl bg-white border border-border p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#d9f3ec] flex items-center justify-center">
                <Share2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xl">Share Notifications</p>
                <p className="text-muted-foreground">When items are shared</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShareNotifications((prev) => !prev)}
              className={`w-14 h-8 rounded-full relative transition-colors ${
                shareNotifications ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${
                  shareNotifications ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>

          <Button
            variant="outline"
            className="w-full h-16 rounded-3xl bg-[#f3fbf8] border-[#d6ece6]"
          >
            <Settings className="w-5 h-5 mr-2" />
            More Settings
          </Button>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-16 rounded-3xl border-red-300 text-red-500 hover:bg-red-50"
          >
            Log Out
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}