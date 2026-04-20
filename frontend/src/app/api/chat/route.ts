import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Login is required.", { status: 401 });
  }

  try {
    const { ownerId, itemId } = await req.json();
    const myId = session.user.id;

    // 본인 아이템에 채팅을 시도하는 경우 방지
    if (myId === ownerId) {
      return new NextResponse("You cannot chat with yourself.", {
        status: 400,
      });
    }

    // 1. 기존 채팅방이 있는지 확인 (@@unique 제약조건 순서에 맞춰 조회)
    // user1Id와 user2Id는 누가 먼저일지 모르므로 두 가지 경우를 체크하거나
    // 생성 시 오름차순으로 정렬해서 넣는 방식을 씁니다.
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

    // 2. 방이 없다면 새로 생성
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

// --- ✅ 새로 추가할 GET 함수 (내 채팅방 목록 가져오기) ---
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Authentication is required.", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");

    // 내가 참여한 모든 채팅방 조회 (user1 또는 user2가 나인 경우)
    const chatRooms = await prisma.chat.findMany({
      where: {
        AND: [
          { OR: [{ user1Id: session.user.id }, { user2Id: session.user.id }] },
          itemId ? { sharedItemId: itemId } : {}, // 특정 아이템 필터링(선택)
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
          take: 1, // 마지막 메시지만 가져옴
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" }, // 최근 활동 순 정렬
    });

    return NextResponse.json(chatRooms);
  } catch (error) {
    console.error("Chat List GET Error:", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
