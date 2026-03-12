import { ArrowLeft, Bell, Share2, Calendar, MessageCircle, Settings } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { useNavigate } from "react-router";
import { BottomNav } from "../components/BottomNav";

export function Notifications() {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: "expiry",
      icon: Calendar,
      title: "Milk expires in 2 days",
      description: "Seoul Milk 500ml will expire on Apr 25",
      time: "1h ago",
      read: false,
    },
    {
      id: 2,
      type: "message",
      icon: MessageCircle,
      title: "New message!",
      description: "Minho Kim sent you a message",
      time: "3h ago",
      read: false,
    },
    {
      id: 3,
      type: "share",
      icon: Share2,
      title: "Item shared with you!",
      description: "Sora shared Carrots with you",
      time: "5h ago",
      read: true,
    },
    {
      id: 4,
      type: "expiry",
      icon: Calendar,
      title: "3 items expiring soon",
      description: "Check your fridge for expiring items",
      time: "Yesterday",
      read: true,
    },
    {
      id: 5,
      type: "message",
      icon: MessageCircle,
      title: "Pickup confirmed",
      description: "Jiyeon confirmed pickup at 6pm",
      time: "Yesterday",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">My Page</h1>
        </div>
      </div>

      {/* Profile Section */}
      <div className="px-6 py-6 bg-card border-b border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-lg mb-1">Seulgi Kim</h2>
            <p className="text-sm text-muted-foreground">seulgi@email.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/20 text-primary">Level 5</Badge>
              <Badge className="bg-secondary/50 text-foreground">128 items shared</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">42</p>
            <p className="text-xs text-muted-foreground">Items</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">15</p>
            <p className="text-xs text-muted-foreground">Shared</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">28</p>
            <p className="text-xs text-muted-foreground">Saved</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">Notifications</h2>
          <Button variant="ghost" size="sm" className="text-primary text-xs">
            Mark all as read
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`bg-card rounded-2xl p-4 border transition-colors ${
                  notification.read
                    ? "border-border"
                    : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === "expiry"
                        ? "bg-destructive/10"
                        : notification.type === "message"
                        ? "bg-accent/10"
                        : "bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        notification.type === "expiry"
                          ? "text-destructive"
                          : notification.type === "message"
                          ? "text-accent"
                          : "text-primary"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm mb-1">{notification.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="px-6 py-4 mt-4">
        <h2 className="text-lg mb-4">Settings</h2>
        
        <div className="space-y-3">
          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm">Push Notifications</h3>
                  <p className="text-xs text-muted-foreground">Get expiry alerts</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <div className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm">Share Notifications</h3>
                  <p className="text-xs text-muted-foreground">When items are shared</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-2xl py-6 border-border"
            onClick={() => {}}
          >
            <Settings className="w-5 h-5 mr-2" />
            More Settings
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-2xl py-6 border-destructive text-destructive hover:bg-destructive/10"
            onClick={() => navigate("/login")}
          >
            Log Out
          </Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
