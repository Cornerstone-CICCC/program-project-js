"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../../lib/pusher"; // Pusher 설정 불러오기
import { useNotifications } from "@/src/hooks/useNotificaitions";
import { cn } from "@/lib/utils";

export default function ChatListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  const { data: session } = useSession();
  const { unreadCount } = useNotifications();

  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();

  // 데이터 페칭 로직 (기능 유지)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // itemId가 있으면 쿼리 추가, 없으면 빈 문자열
        const itemQuery = itemId ? `itemId=${itemId}&` : "";
        const url = `/api/chat?${itemQuery}t=${Date.now()}`;

        const res = await fetch(url, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setChatRooms(data);
        }
      } catch (error) {
        console.error("Failed to load chat list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    window.addEventListener("focus", fetchRooms);
    return () => window.removeEventListener("focus", fetchRooms);

    // ✅ 중요: 의존성 배열의 길이를 처음부터 [itemId, pathname]으로 고정합니다.
    // itemId가 null이든 아니든 배열의 길이는 항상 2로 유지됩니다.
  }, [itemId, pathname]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = getPusherClient();
    const channel = pusher.subscribe(`user-chats-${session.user.id}`);

    channel.bind("update-list", (updatedChat: any) => {
      setChatRooms((prev) => {
        // 1. 기존 리스트에서 해당 채팅방 제거
        const filtered = prev.filter((room) => room.id !== updatedChat.id);
        // 2. 업데이트된 채팅방을 맨 앞으로 추가 (최신순)
        return [updatedChat, ...filtered];
      });
    });

    return () => {
      pusher.unsubscribe(`user-chats-${session.user.id}`);
    };
  }, [session?.user?.id]);

  // 상대방 정보 추출 함수 (기능 유지)
  const getOtherUser = (chat: any) => {
    return chat.user1Id === session?.user?.id ? chat.user2 : chat.user1;
  };

  return (
    <div
      style={{
        padding: "40px 24px 120px 24px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        color: "#1f2937",
        backgroundColor: "#fcfcfc",
        minHeight: "100vh",
      }}
    >
      {/* 헤더: 더 볼드하고 세련된 스타일 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "30px",
          gap: "16px",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontSize: "20px",
            color: "#9ca3af",
            backgroundColor: "white",
            width: "40px",
            height: "40px",
            borderRadius: "14px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #f3f4f6",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "900",
            margin: 0,
            letterSpacing: "-0.025em",
          }}
        >
          Chatting 💬
        </h1>
      </div>

      {/* 2. 특정 아이템 필터링 중일 때 상단 배너 */}
      {itemId && chatRooms.length > 0 && (
        <div className="mx-5 mt-5 p-5 bg-blue-500 rounded-[28px] shadow-[0_15px_30px_-10px_rgba(249,115,22,0.3)] flex items-center justify-between overflow-hidden relative">
          <div className="flex items-center gap-4 z-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
              🥦
            </div>
            <div>
              <p className="text-[11px] text-blue-100 font-black mb-0.5 tracking-wider">
                SELECTED ITEM
              </p>
              <p className="text-base font-extrabold text-white truncate max-w-[180px]">
                {chatRooms[0].sharedItem?.name}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/chat")}
            className="z-10 bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-[900] hover:bg-blue-50 transition-colors shadow-sm"
          >
            View All
          </button>
          {/* 장식용 배경 원 */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full" />
        </div>
      )}

      {/* 3. 채팅방 리스트 */}
      <main className="px-5 pt-6 space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-[5px] border-blue-100 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-gray-400 font-bold">Loading conversations...</p>
          </div>
        ) : chatRooms.length === 0 ? (
          <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-sm">
            <div className="text-5xl mb-6">🏜️</div>
            <p className="text-gray-400 font-[800] text-lg">No messages yet</p>
            <p className="text-gray-300 text-sm mt-1">
              Try sending a sharing request to your neighbor!
            </p>
          </div>
        ) : (
          chatRooms.map((chat) => {
            const otherUser = getOtherUser(chat);

            // ✅ [추가] 안 읽은 메시지 여부 및 개수 파악
            const unreadCountInRoom = chat._count?.messages || 0;
            const hasUnread = unreadCountInRoom > 0;

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                // ✅ [수정] hasUnread일 때 배경색 미세하게 변경 (기존 디자인 유지하며 배경만 조건부 추가)
                className={cn(
                  "flex items-center gap-4 p-5 rounded-[32px] border transition-all active:scale-[0.98] group",
                  hasUnread
                    ? "bg-blue-50/50 border-blue-100 shadow-[0_10px_20px_-5px_rgba(249,115,22,0.05)]"
                    : "bg-white border-gray-100/50 hover:border-blue-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.08)]",
                )}
              >
                {/* 아바타 영역 */}
                <div className="relative flex-shrink-0">
                  {otherUser?.avatar ? (
                    <img
                      src={otherUser.avatar}
                      className="w-[68px] h-[68px] rounded-[24px] object-cover border-2 border-white shadow-sm"
                      alt="profile"
                    />
                  ) : (
                    <div className="w-[68px] h-[68px] bg-gradient-to-br from-blue-50 to-blue-100 rounded-[24px] flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                      👤
                    </div>
                  )}

                  {hasUnread ? (
                    <div className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm z-10">
                      {unreadCountInRoom > 9 ? "9+" : unreadCountInRoom}
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-green-500 border-[3px] border-white rounded-full"></div>
                  )}
                </div>

                {/* 채팅 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3
                      className={cn(
                        "text-[17px] group-hover:text-blue-600 transition-colors",
                        // ✅ [수정] 안 읽은 메시지 있으면 폰트 가중치 최대화
                        hasUnread
                          ? "font-[900] text-black"
                          : "font-[800] text-[#1f2937]",
                      )}
                    >
                      {otherUser?.firstName} {otherUser?.lastName || "Neighbor"}
                    </h3>
                    <span
                      className={cn(
                        "text-[11px] font-bold px-2 py-1 rounded-lg",
                        // ✅ [수정] 안 읽은 메시지 있으면 날짜 태그 색상 강조
                        hasUnread
                          ? "bg-blue-500 text-white"
                          : "bg-gray-50 text-gray-400",
                      )}
                    >
                      {chat.messages?.[0] ? "Just now" : ""}
                    </span>
                  </div>

                  {/* ✅ [수정] 안 읽은 메시지 있으면 텍스트 진하게 */}
                  <p
                    className={cn(
                      "text-[14px] truncate mb-2 pr-4",
                      hasUnread
                        ? "text-gray-900 font-bold"
                        : "text-gray-500 font-medium",
                    )}
                  >
                    {chat.messages?.[0]?.content ||
                      "A new chat room has been created."}
                  </p>

                  {/* 아이템 태그 */}
                  {chat.sharedItem && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors border border-gray-100/50 group-hover:border-blue-100">
                      <span className="text-[12px]">📦</span>
                      <span className="text-[11px] text-gray-500 font-extrabold group-hover:text-blue-500">
                        {chat.sharedItem.name}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </main>
    </div>
  );
}
