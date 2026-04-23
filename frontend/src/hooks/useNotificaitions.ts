"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getPusherClient } from "../../lib/pusher"; // 경로 확인!
import toast from "react-hot-toast";

export const useNotifications = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 1. 세션이나 유저 ID가 없으면 실행하지 않음
    const userId = (session?.user as any)?.id;
    if (!userId) return;

    // 2. 초기 로드 시 읽지 않은 알림 개수 확인
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          // 알림 객체에 isRead 필드가 있는지 확인 필요
          const unread = data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Failed to load notifications:", error);
      }
    };

    fetchNotifications();

    // 3. Pusher 실시간 구독
    const pusher = getPusherClient();
    const channelName = `notify-${userId}`;
    const channel = pusher.subscribe(channelName);

    // 이벤트 핸들러를 별도 함수로 분리 (메모리 누수 방지 및 정리 용이)
    const handleNewNotification = (data: any) => {
      setUnreadCount((prev) => prev + 1);
      toast(data.content || "You have a new notification.", {
        icon: "🔔",
        duration: 4000,
        style: {
          borderRadius: "15px",
          background: "#333",
          color: "#fff",
        },
      });
    };

    channel.bind("new-notification", handleNewNotification);

    // 4. Cleanup: 언마운트 시 구독 해제 및 바인딩 제거
    return () => {
      channel.unbind("new-notification", handleNewNotification);
      pusher.unsubscribe(channelName);
    };
  }, [session?.user?.id]); // ✅ session 전체보다 id를 종속성으로 넣는 것이 더 정확합니다.

  return { unreadCount, setUnreadCount };
};
