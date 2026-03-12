import { useState } from "react";
import { ArrowLeft, Send, MoreVertical, Circle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav";

export function Chat() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState<number | null>(null);

  const chats = [
    {
      id: 1,
      name: "Minho Kim",
      avatar: "👤",
      lastMessage: "Yes, until tomorrow!",
      time: "2m ago",
      unread: 0,
      online: true,
    },
    {
      id: 2,
      name: "Sora Lee",
      avatar: "👩",
      lastMessage: "Great! I'll pick up at 6pm..",
      time: "1h ago",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Jiyeon Park",
      avatar: "👩‍🦰",
      lastMessage: "Thanks for the milk! 😊",
      time: "3h ago",
      unread: 2,
      online: true,
    },
    {
      id: 4,
      name: "Community Group",
      avatar: "👥",
      lastMessage: "Anyone has extra eggs?",
      time: "5h ago",
      unread: 5,
      online: false,
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Minho Kim",
      text: "Hi! is the milk still available?",
      time: "10:25 AM",
      isMine: false,
    },
    {
      id: 2,
      sender: "Me",
      text: "Yes, until tomorrow!",
      time: "10:26 AM",
      isMine: true,
    },
    {
      id: 3,
      sender: "Me",
      text: "Would you like to pick it up today?",
      time: "10:26 AM",
      isMine: true,
    },
    {
      id: 4,
      sender: "Minho Kim",
      text: "Great! I'll pick up at 6pm..",
      time: "10:30 AM",
      isMine: false,
    },
    {
      id: 5,
      sender: "Me",
      text: "Perfect! See you then 😊",
      time: "10:31 AM",
      isMine: true,
    },
  ];

  if (selectedChat !== null) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="bg-card px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSelectedChat(null)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-lg">
                  👤
                </div>
                <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-primary text-primary" />
              </div>

              <div>
                <h2 className="text-sm">Minho Kim</h2>
                <p className="text-xs text-primary">Online</p>
              </div>
            </div>

            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  msg.isMine
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-card border border-border rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isMine ? "text-white/70" : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
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
            />
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-white"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Header */}
      <div className="bg-card px-6 py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/ingredients")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <h1 className="text-xl">Chat</h1>

          <Button variant="ghost" size="icon" className="rounded-full ml-auto">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <div className="divide-y divide-border">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat.id)}
            className="px-6 py-4 hover:bg-secondary/20 cursor-pointer transition-colors"
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
                  <span className="text-xs text-muted-foreground ml-2">
                    {chat.time}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground truncate">
                  {chat.lastMessage}
                </p>
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

      {/* New Chat Button */}
      <Button className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg">
        <span className="text-2xl">+</span>
      </Button>

      <BottomNav />
    </div>
  );
}