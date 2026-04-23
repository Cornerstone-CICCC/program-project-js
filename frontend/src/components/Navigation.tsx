"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNotifications } from "../hooks/useNotificaitions";
import { cn } from "@/lib/utils"; // cn이 없다면 아래 NavItem 내부 className 수정을 참고하세요.

export default function Navigation() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  // 특정 페이지(예: 채팅방 내부, 로그인 페이지 등)에서 네비게이션을 숨기고 싶을 때
  const hideNavPaths = ["/login", "/register"];
  const isChatRoom = pathname.startsWith("/chat/");

  if (hideNavPaths.includes(pathname) || isChatRoom) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-md border-t border-gray-100 flex justify-around items-center pb-2.5 z-[100]">
      <Link href="/" className="no-underline color-inherit">
        <NavItem icon="🏠" label="Home" active={pathname === "/"} />
      </Link>

      <Link href="/recipe" className="no-underline color-inherit">
        <NavItem icon="🍳" label="Recipe" active={pathname === "/recipe"} />
      </Link>

      <Link href="/shared" className="no-underline color-inherit">
        <NavItem
          icon="🤝"
          label="Share"
          active={pathname.startsWith("/shared")}
        />
      </Link>

      <Link href="/chat" className="no-underline color-inherit">
        <NavItem
          icon="💬"
          label="Chat"
          active={pathname === "/chat"}
          badge={unreadCount}
        />
      </Link>

      <Link href="/mypage" className="no-underline color-inherit">
        <NavItem icon="👤" label="My" active={pathname === "/mypage"} />
      </Link>
    </nav>
  );
}

// 내부 컴포넌트: NavItem
function NavItem({
  icon,
  label,
  active = false,
  badge = 0,
}: {
  icon: string;
  label: string;
  active?: boolean;
  badge?: number;
}) {
  return (
    <div
      className={cn(
        "text-center cursor-pointer transition-all flex flex-col items-center",
        active ? "opacity-100 scale-105" : "opacity-40",
      )}
    >
      <div className="text-[20px] relative">
        {icon}
        {/* ✅ 알림 배지: Chat 아이콘에 숫자가 있을 때만 표시 */}
        {badge > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <div
        className={cn(
          "text-[10px] mt-1 tracking-tight",
          active ? "font-[800]" : "font-[500]",
        )}
      >
        {label}
      </div>
    </div>
  );
}
