import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Pusher from "pusher";

const prisma = new PrismaClient();

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
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { content } = await req.json();

    const message = await prisma.message.create({
      data: { chatId, senderId: session.user.id, content },
    });

    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date(), lastMessage: content },
    });

    // ✅ Pusher를 통해 해당 채팅방 채널에 'new-message' 이벤트 전송
    await pusher.trigger(`chat-${chatId}`, "new-message", message);

    return NextResponse.json(message);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
