import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 1. 유저 정보 조회 (GET)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // 1. 세션 체크
    if (!session?.user?.email) {
      console.error("❌ [API ME] No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. DB에서 유저 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        location: true,
        _count: {
          select: { ingredients: true },
        },
      },
    });

    if (!user) {
      console.error(
        `❌ [API ME] User not found for email: ${session.user.email}`,
      );
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 3. 나눔 카운트 조회 (try-catch로 감싸서 하나가 실패해도 전체가 죽지 않게 함)
    let sharedCount = 0;
    try {
      sharedCount = await prisma.sharedItem.count({
        where: {
          userId: user.id, // 👈 ownerId 대신 userId 사용 (에러 메시지에 id, userId가 보입니다)
          status: "completed",
        },
      });
    } catch (dbError) {
      console.error("⚠️ [API ME] SharedCount fetch failed:", dbError);
    }

    return NextResponse.json({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      location: user.location || "",
      ingredientCount: user._count?.ingredients || 0,
      sharedCount: sharedCount,
    });
  } catch (error: any) {
    // 📍 여기서 찍히는 에러 메시지가 핵심입니다! VS Code 터미널을 확인하세요.
    console.error("🔥 [API ME] CRITICAL ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 },
    );
  }
}

// 2. 유저 정보 수정 (PATCH)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { location } = body;

    if (typeof location !== "string") {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { location: location.trim() },
    });

    return NextResponse.json({
      message: "Success",
      location: updatedUser.location,
    });
  } catch (error) {
    console.error("PATCH User Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
