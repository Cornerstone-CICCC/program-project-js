import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Pusher from "pusher";
import { db } from "@/lib/db"; // 기존에 사용하던 db 인스턴스 사용
import { createNotification } from "@/lib/notification"; // 이 함수를 가져왔는지 확인!

// Pusher 서버 인스턴스 설정
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // Next.js 최신 버전 대응 (Promise)
) {
  try {
    const { id: chatId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const senderId = session.user.id;
    const { content } = await req.json();

    // 1. 메시지 생성
    const message = await db.message.create({
      data: {
        chatId,
        senderId,
        content,
      },
    });

    // 2. 채팅방 업데이트 (시간 및 마지막 메시지)
    // 리스트 갱신을 위해 업데이트된 채팅방의 모든 정보(유저, 아이템 포함)를 가져옵니다.
    const updatedChat = await db.chat.update({
      where: { id: chatId },
      data: {
        updatedAt: new Date(),
        lastMessage: content,
      },
      include: {
        messages: { take: 1, orderBy: { createdAt: "desc" } },
        user1: true,
        user2: true,
        sharedItem: true,
      },
    });

    // 3. 상대방(Receiver) ID 찾기
    const receiverId =
      updatedChat.user1Id === senderId
        ? updatedChat.user2Id
        : updatedChat.user1Id;

    // 🚀 여기에 추가하세요!
    try {
      await createNotification({
        userId: receiverId,
        type: "CHAT",
        title: "New Message",
        content: content,
      });
    } catch (nError) {
      // 알림 생성 실패가 채팅 메시지 전송 자체를 막지 않도록 에러 처리
      console.error("Notification failed:", nError);
    }

    // 4. ✅ Pusher 실시간 이벤트 전송
    // (1) 채팅방 내부: 새로운 메시지 한 개 전송
    await pusher.trigger(`chat-${chatId}`, "new-message", message);

    // (2) 채팅 목록 페이지: 나(sender)와 상대방(receiver)의 리스트를 실시간 갱신
    await pusher.trigger(`user-chats-${senderId}`, "update-list", updatedChat);
    await pusher.trigger(
      `user-chats-${receiverId}`,
      "update-list",
      updatedChat,
    );

    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGE_POST_ERROR]", error);
    return new NextResponse("Error", { status: 500 });
  }
}
