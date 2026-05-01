"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../lib/pusher";

export const useNotifications = () => {
  const { data: session, status } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  // ✅ 1. 데이터 페칭 로직을 useCallback으로 분리 (재사용 가능)
  const fetchNotifications = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });

      // ⬇️ [수정] 응답이 정상(ok)이고 Content-Type이 JSON인 경우에만 처리
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType?.includes("application/json")) {
        const data = await res.json();
        // isRead가 false인 알림들만 필터링해서 카운트
        const unread = data.filter((n: any) => !n.isRead).length;

        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [status]); // status를 의존성에 추가

  useEffect(() => {
    const userId = (session?.user as any)?.id;
    if (status !== "authenticated" || !userId) return;

    // 초기 로드
    fetchNotifications();

    // ✅ 2. 뒤로가기/포커스 시 데이터 갱신
    // 사용자가 채팅방에서 나거나 창을 다시 볼 때 최신 개수를 가져옵니다.
    window.addEventListener("focus", fetchNotifications);

    // Pusher 실시간 구독
    const pusher = getPusherClient();
    const channelName = `notify-${userId}`;
    const channel = pusher.subscribe(channelName);

    const handleNewNotification = () => {
      setUnreadCount((prev) => prev + 1);
    };

    channel.bind("new-notification", handleNewNotification);

    // 3. Cleanup
    return () => {
      window.removeEventListener("focus", fetchNotifications);
      channel.unbind("new-notification", handleNewNotification);
      pusher.unsubscribe(channelName);
    };
  }, [session?.user?.id, status, fetchNotifications]); // status 추가

  // ✅ fetchNotifications를 반환값에 포함시켜 페이지에서 직접 호출 가능하게 함
  return { unreadCount, setUnreadCount, fetchNotifications };
};
