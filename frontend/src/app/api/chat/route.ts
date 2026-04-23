import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// 1. POST: 채팅방 생성 또는 기존 방 조회
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Login is required.", { status: 401 });
  }

  try {
    const { ownerId, itemId } = await req.json();
    const myId = session.user.id;

    if (myId === ownerId) {
      return new NextResponse("You cannot chat with yourself.", {
        status: 400,
      });
    }

    const [u1, u2] = [myId, ownerId].sort();

    let chat = await prisma.chat.findUnique({
      where: {
        user1Id_user2Id_sharedItemId: {
          user1Id: u1,
          user2Id: u2,
          sharedItemId: itemId,
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          user1Id: u1,
          user2Id: u2,
          sharedItemId: itemId,
        },
      });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Chat room creation error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";

// 2. GET: 내 채팅방 목록 가져오기 (안 읽은 알림 강조용 데이터 포함)
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Authentication is required.", { status: 401 });
    }

    const currentUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    const chatRooms = await prisma.chat.findMany({
      where: {
        AND: [
          { OR: [{ user1Id: currentUserId }, { user2Id: currentUserId }] },
          itemId ? { sharedItemId: itemId } : {},
        ],
      },
      include: {
        user1: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        user2: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        sharedItem: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        // ✅ [추가 포인트] 안 읽은 알림 개수 집계
        _count: {
          select: {
            messages: {
              where: {
                NOT: { senderId: currentUserId }, // 내가 보낸 게 아니고
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error("Chat List GET Error:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
