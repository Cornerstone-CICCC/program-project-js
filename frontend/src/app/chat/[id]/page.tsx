"use client";

import { useState, useEffect, useRef, use, useMemo } from "react";
import Pusher from "pusher-js";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: chatId } = use(params);
  const router = useRouter();
  const { data: session } = useSession();

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Pusher 인스턴스를 메모이제이션 (인스턴스가 한 번만 생성되도록 고정)
  const pusher = useMemo(() => {
    if (typeof window === "undefined") return null;

    // 만약 Pusher가 함수가 아니라면 .default를 사용하도록 방어 코드를 짭니다.
    const PusherClient = (Pusher as any).default || Pusher;

    return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true,
    });
  }, []);

  // 2. 초기 데이터 로드 (기존 메시지 내역)
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        if (res.ok) {
          const data = await res.json();
          setChat(data);
          setMessages(data.messages || []);
        }
      } catch (error) {
        toast.error("Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    };
    fetchChatData();
  }, [chatId]);

  // 3. 실시간 구독 및 이벤트 바인딩
  useEffect(() => {
    if (!chatId || !pusher) return;

    const channel = pusher.subscribe(`chat-${chatId}`);

    channel.bind("new-message", (newMessage: any) => {
      setMessages((prev) => {
        // 중복 방지: 이미 목록에 있는 ID라면 추가하지 않음
        if (prev.find((m) => m.id === newMessage.id)) return prev;
        return [...prev, newMessage];
      });
    });

    return () => {
      // ✅ Cleanup: 페이지를 이동하거나 나갈 때 구독 해제만 수행 (연결 종료는 pusher가 알아서 관리)
      channel.unbind_all();
      pusher.unsubscribe(`chat-${chatId}`);
    };
  }, [chatId, pusher]);

  // 4. 메시지 전송 핸들러
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempMessage = {
      id: Date.now().toString(), // 임시 ID
      content: input,
      senderId: session?.user?.id,
      createdAt: new Date(),
    };

    const currentInput = input;
    setInput("");

    try {
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentInput }),
      });
      if (!res.ok) throw new Error();
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading)
    return (
      <div className="p-20 text-center font-bold">
        Connecting to chat room...
      </div>
    );
  if (!chat)
    return (
      <div className="p-20 text-center font-bold">Chat room not found.</div>
    );

  const otherUser =
    chat.user1Id === session?.user?.id ? chat.user2 : chat.user1;

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] max-w-[600px] mx-auto shadow-2xl shadow-gray-200/50">
      {/* 상단 헤더 */}
      <header className="bg-white/90 backdrop-blur-md px-4 py-4 flex items-center border-b border-gray-100 sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 mr-2">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1f2937"
            strokeWidth="2.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center text-lg">
            👤
          </div>
          <div>
            <h2 className="font-[900] text-[#1f2937] text-base leading-none mb-1">
              {otherUser?.firstName}
              {otherUser?.lastName}
            </h2>
            <span className="text-[10px] text-green-500 font-bold">Online</span>
          </div>
        </div>
      </header>

      {/* 연결된 아이템 정보 바 */}
      {chat.sharedItem && (
        <div className="bg-white px-5 py-3 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={chat.sharedItem.imageUrl}
              className="w-12 h-12 rounded-xl object-cover border border-gray-100"
            />
            <div>
              <p className="text-[10px] text-gray-400 font-black">
                Sharing Info
              </p>
              <p className="text-sm font-extrabold text-[#1f2937]">
                {chat.sharedItem.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/shared/${chat.sharedItemId}`)}
            className="text-[11px] font-black text-blue-600 bg-blue-50 px-3 py-2 rounded-xl"
          >
            View Details
          </button>
        </div>
      )}

      {/* 메시지 리스트 */}
      <main className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.senderId === session?.user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] p-4 rounded-[24px] text-[15px] font-medium leading-relaxed shadow-sm
                ${isMe ? "bg-blue-500 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* 입력창 */}
      <footer className="p-5 bg-white border-t border-gray-100 pb-8">
        <form onSubmit={sendMessage} className="flex gap-2 relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message to your neighbor"
            className="flex-1 bg-gray-50 border-none rounded-[20px] px-6 py-4 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white w-[54px] h-[54px] rounded-[18px] flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
