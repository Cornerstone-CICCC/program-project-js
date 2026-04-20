"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils"; // cn 유틸리티가 없다면 클래스 합치기 로직으로 대체 가능

export default function ChatListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  const { data: session } = useSession();

  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 페칭 로직 (기능 유지)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const url = itemId ? `/api/chat?itemId=${itemId}` : "/api/chat";
        const res = await fetch(url);
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
  }, [itemId]);

  // 상대방 정보 추출 함수 (기능 유지)
  const getOtherUser = (chat: any) => {
    return chat.user1Id === session?.user?.id ? chat.user2 : chat.user1;
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-[100px]">
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 1. 상단 헤더 - 메인 톤에 맞춘 볼드 디자인 */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-xl z-30 border-b border-gray-50 px-6 py-5">
          <div className="flex items-center gap-4">
            {itemId && (
              <button
                onClick={() => router.push("/chat")}
                className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1f2937"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <h1 className="text-[26px] font-[900] text-gray-900 tracking-tight">
              {itemId ? "Sharing Chat" : "Messages"}
            </h1>
          </div>
        </header>

        {/* 2. 특정 아이템 필터링 중일 때 상단 배너 */}
        {itemId && chatRooms.length > 0 && (
          <div className="mx-5 mt-5 p-5 bg-orange-500 rounded-[28px] shadow-[0_15px_30px_-10px_rgba(249,115,22,0.3)] flex items-center justify-between overflow-hidden relative">
            <div className="flex items-center gap-4 z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                🥦
              </div>
              <div>
                <p className="text-[11px] text-orange-100 font-black mb-0.5 tracking-wider">
                  SELECTED ITEM
                </p>
                <p className="text-base font-extrabold text-white truncate max-w-[180px]">
                  {chatRooms[0].sharedItem?.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push("/chat")}
              className="z-10 bg-white text-orange-600 px-4 py-2 rounded-xl text-xs font-[900] hover:bg-orange-50 transition-colors shadow-sm"
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
              <div className="w-10 h-10 border-[5px] border-orange-100 border-t-orange-500 rounded-full animate-spin" />
              <p className="text-gray-400 font-bold">
                Loading conversations...
              </p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100 shadow-sm">
              <div className="text-5xl mb-6">🏜️</div>
              <p className="text-gray-400 font-[800] text-lg">
                No messages yet
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Try sending a sharing request to your neighbor!
              </p>
            </div>
          ) : (
            chatRooms.map((chat) => {
              const otherUser = getOtherUser(chat);
              return (
                <Link
                  key={chat.id}
                  href={`/chat/${chat.id}`}
                  className="flex items-center gap-4 p-5 bg-white rounded-[32px] border border-gray-100/50 hover:border-orange-200 hover:shadow-[0_10px_25px_-5px_rgba(249,115,22,0.08)] transition-all active:scale-[0.98] group"
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
                      <div className="w-[68px] h-[68px] bg-gradient-to-br from-orange-50 to-orange-100 rounded-[24px] flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                        👤
                      </div>
                    )}
                    {/* 온라인 뱃지 */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-green-500 border-[3px] border-white rounded-full"></div>
                  </div>

                  {/* 채팅 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="font-[800] text-[#1f2937] text-[17px] group-hover:text-blue-600 transition-colors">
                        {otherUser?.firstName}
                        {otherUser?.lastName || "Neighbor"}
                      </h3>
                      <span className="text-[11px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-lg">
                        {chat.messages?.[0] ? "Just now" : ""}
                      </span>
                    </div>

                    <p className="text-[14px] text-gray-500 truncate font-medium mb-2 pr-4">
                      {chat.messages?.[0]?.content ||
                        "A new chat room has been created."}
                    </p>

                    {/* 아이템 태그 */}
                    {chat.sharedItem && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-xl group-hover:bg-orange-50 transition-colors border border-gray-100/50 group-hover:border-orange-100">
                        <span className="text-[12px]">📦</span>
                        <span className="text-[11px] text-gray-500 font-extrabold group-hover:text-orange-500">
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

      {/* 하단 내비게이션 바 */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          backgroundColor: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid #f3f4f6",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          paddingBottom: "10px",
          zIndex: 100,
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <NavItem icon="🏠" label="Home" />
        </Link>
        <Link
          href="/recipe"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="🍳" label="Recipe" />
        </Link>
        <Link
          href="/shared"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="🤝" label="Share" />
        </Link>
        <Link href="/chat" style={{ textDecoration: "none", color: "inherit" }}>
          <NavItem icon="💬" label="Chat" active />
        </Link>
        <Link
          href="/mypage"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <NavItem icon="👤" label="My" />
        </Link>
      </nav>
    </div>
  );
}

// 🏠 내비게이션 아이템 함수형 컴포넌트 (파일 하단에 포함)
function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        cursor: "pointer",
        opacity: active ? 1 : 0.4,
      }}
    >
      <div style={{ fontSize: "20px" }}>{icon}</div>
      <div
        style={{
          fontSize: "10px",
          fontWeight: active ? "800" : "500",
          marginTop: "4px",
        }}
      >
        {label}
      </div>
    </div>
  );
}
