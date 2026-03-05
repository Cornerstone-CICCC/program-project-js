// src/app/pages/chat/ChatPage.tsx
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Send, MoreVertical, Circle } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

import { useChat } from "../../hooks/useChat";

export default function ChatPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const token = localStorage.getItem("ff_token");
  const sharedPostId = params.get("postId"); // ✅ MVP key

  const { messages, isLoading, error, send, refresh } = useChat(sharedPostId, token);

  const [message, setMessage] = useState("");

  const canSend = useMemo(() => {
    return !!sharedPostId && message.trim().length > 0;
  }, [sharedPostId, message]);

  async function onSend() {
    if (!canSend) return;
    const text = message.trim();
    setMessage("");
    try {
      await send(text);
    } catch (e: any) {
      // restore input if failed
      setMessage(text);
      alert(e?.message ?? "Failed to send message");
    }
  }

  // --- Figma dummy chat list (UI 유지용) ---
  // 실제 채팅 목록을 만들려면 "Conversation/Thread" 테이블이 필요함.
  const dummyChats = [
    { id: "demo-1", name: "Minho Kim", avatar: "👤", lastMessage: "Yes, until tomorrow!", time: "2m ago", unread: 0, online: true },
    { id: "demo-2", name: "Sora Lee", avatar: "👩", lastMessage: "Great! I'll pick up at 6pm..", time: "1h ago", unread: 0, online: false },
    { id: "demo-3", name: "Jiyeon Park", avatar: "👩‍🦰", lastMessage: "Thanks for the milk! 😊", time: "3h ago", unread: 2, online: true },
    { id: "demo-4", name: "Community Group", avatar: "👥", lastMessage: "Anyone has extra eggs?", time: "5h ago", unread: 5, online: false },
  ];

  // ---------------------------
  // Thread view (when postId exists)
  // ---------------------------
  if (sharedPostId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="bg-card px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => navigate(-1)}
              type="button"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                  💬
                </div>
                <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-primary text-primary" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm truncate">Shared Post Chat</h2>
                <p className="text-xs text-primary truncate">postId: {sharedPostId}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              type="button"
              onClick={refresh}
              title="Refresh"
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading && <div className="text-sm text-muted-foreground">Loading messages...</div>}
          {error && (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No messages yet. Send the first message 👋
            </div>
          )}

          {messages.map((msg) => {
            // MVP: without auth userId in this page, we can’t perfectly align “mine”.
            // If your /api/auth/me returns user.id, we can align using senderId === me.id.
            const isMine = false;

            const timeLabel = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMine
                      ? "bg-primary text-white rounded-br-sm"
                      : "bg-card border border-border rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isMine ? "text-white/70" : "text-muted-foreground"
                    }`}
                  >
                    {timeLabel}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input */}
        <div className="bg-card border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-input-background rounded-full border-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") onSend();
              }}
            />
            <Button
              size="icon"
              type="button"
              disabled={!canSend}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white disabled:opacity-60"
              onClick={onSend}
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {!token && (
            <div className="mt-2 text-xs text-destructive">
              You are not logged in. Please log in again.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------
  // List view (no postId): keep Figma UI + 안내
  // ---------------------------
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/ingredients")}
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl">Chat</h1>
          <Button variant="ghost" size="icon" className="rounded-full ml-auto" type="button">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 안내 카드 */}
      <div className="px-6 py-4">
        <div className="bg-secondary/20 border border-border rounded-2xl p-4 text-sm text-muted-foreground">
          Open a chat from the <span className="text-primary font-medium">Shared Board</span> by clicking
          <span className="text-primary font-medium"> Message</span>. <br />
          Example: go to{" "}
          <Link to="/share" className="text-primary underline">
            Shared Board
          </Link>{" "}
          and click Message.
        </div>
      </div>

      {/* Chat List (dummy UI 유지) */}
      <div className="divide-y divide-border">
        {dummyChats.map((chat) => (
          <div
            key={chat.id}
            className="px-6 py-4 hover:bg-secondary/20 cursor-pointer transition-colors"
            onClick={() => alert("This is a UI preview. Chats are per Shared Post in MVP.")}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-xl">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-primary text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm truncate">{chat.name}</h3>
                  <span className="text-xs text-muted-foreground ml-2">{chat.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>

              {chat.unread > 0 && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-white">
                  {chat.unread}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Chat Button (MVP에선 ShareBoard에서 시작) */}
      <Button
        type="button"
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg"
        onClick={() => navigate("/share")}
        title="Start from Shared Board"
      >
        <span className="text-2xl">+</span>
      </Button>
    </div>
  );
}