import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; // 세션 확인 (설정에 따라 auth()로 대체 가능)
import { authOptions } from "@/lib/auth"; // 본인의 authOptions 경로 확인
import { db } from "../../../../lib/db"; // 루트 lib 폴더로 거슬러 올라감

// 1. 내 알림 목록 가져오기 (GET)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("로그인이 필요합니다.", { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: {
        userId: (session.user as any).id, // 세션에 저장된 유저 ID
      },
      orderBy: {
        createdAt: "desc", // 최신순 정렬
      },
      take: 20, // 최근 20개만 가져오기
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// 2. 모든 알림 읽음 처리 (PATCH)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user)
      return new NextResponse("Unauthorized", { status: 401 });

    // 내 모든 안 읽은 알림을 읽음 처리
    await db.notification.updateMany({
      where: {
        userId: (session.user as any).id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
