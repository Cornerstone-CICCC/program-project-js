import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. 인증 체크
    if (!session?.user?.id) {
      return new NextResponse("Authentication is required.", { status: 401 });
    }

    // 2. params 언래핑 (Next.js 15+ 대응)
    const { id: chatId } = await params;

    // 3. 데이터 조회 (스키마 필드명: sharedItem, messages, content 확인 완료)
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        user1: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        user2: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        sharedItem: true, // ✅ 스키마의 sharedItem 모델과 연결
        messages: {
          orderBy: { createdAt: "asc" }, // 대화순 정렬
        },
      },
    });

    if (!chat) {
      return new NextResponse("Chat room not found.", { status: 404 });
    }

    // 4. 보안 체크: 채팅 참여자가 아닌 유저가 접근할 경우 차단
    if (chat.user1Id !== session.user.id && chat.user2Id !== session.user.id) {
      return new NextResponse("Access denied.", { status: 403 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Critical Chat API Error:", error);
    return new NextResponse("Internal server error occurred.", { status: 500 });
  }
}

// ✅ 2. 채팅방 삭제 (DELETE) 추가
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: chatId } = await params;

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 채팅방 존재 여부 및 참여 권한 확인
    const chatRoom = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chatRoom) {
      return new NextResponse("Chat room not found.", { status: 404 });
    }

    // 참여자(user1 또는 user2)만 삭제 가능하도록 체크
    if (
      chatRoom.user1Id !== session.user.id &&
      chatRoom.user2Id !== session.user.id
    ) {
      return new NextResponse("Access denied.", { status: 403 });
    }

    // DB에서 삭제 (상대방의 목록에서도 완전히 사라집니다)
    await prisma.chat.delete({
      where: { id: chatId },
    });

    return NextResponse.json({ message: "Chat room deleted successfully" });
  } catch (error: any) {
    console.error("Delete Chat Error:", error);
    return new NextResponse("Internal server error occurred.", { status: 500 });
  }
}
