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
