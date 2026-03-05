// src/app/pages/notifications/NotificationsPage.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Share2,
  Calendar,
  MessageCircle,
  Settings,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";

import { useNotifications } from "../../hooks/useNotifications";

function getNotificationType(message: string): "expiry" | "message" | "share" {
  const m = message.toLowerCase();
  if (m.includes("expire") || m.includes("expiry") || m.includes("expir")) return "expiry";
  if (m.includes("message") || m.includes("chat") || m.includes("sent you")) return "message";
  if (m.includes("share") || m.includes("shared") || m.includes("pickup")) return "share";
  return "share";
}

function getIconByType(type: "expiry" | "message" | "share") {
  if (type === "expiry") return Calendar;
  if (type === "message") return MessageCircle;
  return Share2;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("ff_token");

  const { items, isLoading, error, refresh, markRead } = useNotifications(token);

  // UI settings (frontend only for now)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [shareEnabled, setShareEnabled] = useState(true);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  const stats = useMemo(() => {
    // MVP-friendly stats derived from notifications only (placeholders)
    const shared = items.filter((n) => getNotificationType(n.message) === "share").length;
    return {
      items: items.length,
      shared,
      saved: Math.max(0, items.length - shared),
    };
  }, [items]);

  async function markAllAsRead() {
    const unread = items.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    // Simple sequential (safe for beginners). Can optimize later with Promise.all.
    for (const n of unread) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await markRead(n.id, true);
      } catch {
        // ignore partial failures
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem("ff_token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            type="button"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">My Page</h1>

          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-primary"
            type="button"
            onClick={refresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Profile Section (placeholder) */}
      <div className="px-6 py-6 bg-card border-b border-border">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-3xl">
            👤
          </div>
          <div className="flex-1">
            <h2 className="text-lg mb-1">FridgeFriend User</h2>
            <p className="text-sm text-muted-foreground">you@example.com</p>

            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-primary/20 text-primary">Level 1</Badge>
              <Badge className="bg-secondary/50 text-foreground">
                {stats.shared} share notifications
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">{stats.items}</p>
            <p className="text-xs text-muted-foreground">Notifs</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">{stats.shared}</p>
            <p className="text-xs text-muted-foreground">Share</p>
          </div>
          <div className="bg-background rounded-xl p-3 text-center">
            <p className="text-2xl mb-1">{stats.saved}</p>
            <p className="text-xs text-muted-foreground">Other</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-primary text-xs"
            type="button"
            onClick={markAllAsRead}
            disabled={items.length === 0 || unreadCount === 0}
          >
            Mark all as read
          </Button>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground mb-3">Loading...</div>}
        {error && (
          <div className="mb-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {items.map((n) => {
            const type = getNotificationType(n.message);
            const Icon = getIconByType(type);

            const title =
              type === "expiry"
                ? "Expiry Alert"
                : type === "message"
                ? "New message"
                : "Share update";

            // We don't have a "time ago" field in ERD, so use createdAt formatted simply.
            const timeLabel = new Date(n.createdAt).toLocaleString();

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id, true)}
                className={`w-full text-left bg-card rounded-2xl p-4 border transition-colors ${
                  n.isRead ? "border-border" : "border-primary/30 bg-primary/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      type === "expiry"
                        ? "bg-destructive/10"
                        : type === "message"
                        ? "bg-accent/10"
                        : "bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        type === "expiry"
                          ? "text-destructive"
                          : type === "message"
                          ? "text-accent"
                          : "text-primary"
                      }`}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-sm mb-1">
                      {title} {!n.isRead && <span className="text-primary">•</span>}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">{n.message}</p>
                    <p className="text-xs text-muted-foreground">{timeLabel}</p>
                  </div>

                  {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                </div>
              </button>
            );
          })}

          {!isLoading && !error && items.length === 0 && (
            <div className="bg-card rounded-2xl p-6 border border-border text-sm text-muted-foreground">
              No notifications yet.
            </div>
          )}
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
              <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
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
              <Switch checked={shareEnabled} onCheckedChange={setShareEnabled} />
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-2xl py-6 border-border"
            type="button"
            onClick={() => alert("More Settings: coming soon")}
          >
            <Settings className="w-5 h-5 mr-2" />
            More Settings
          </Button>

          <Button
            variant="outline"
            className="w-full rounded-2xl py-6 border-destructive text-destructive hover:bg-destructive/10"
            type="button"
            onClick={handleLogout}
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}