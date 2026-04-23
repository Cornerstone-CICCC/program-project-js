import { db } from "./db";
import { pusherServer } from "./pusher";

export const createNotification = async ({
  userId,
  type,
  title,
  content,
}: {
  userId: string;
  type: string;
  title: string;
  content: string;
}) => {
  try {
    // 1. DB에 알림 저장
    const notification = await db.notification.create({
      data: {
        userId,
        type,
        title,
        content,
      },
    });

    // 2. Pusher를 통해 실시간 전송
    // 사용자 개별 채널(notify-사용자ID)로 보냅니다.
    await pusherServer.trigger(
      `notify-${userId}`,
      "new-notification",
      notification,
    );

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
};
