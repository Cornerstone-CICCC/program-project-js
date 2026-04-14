import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 이메일로 유저를 찾으면서 관련 데이터 개수를 한 번에 가져옵니다.
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      level: true,
      location: true,
      // _count를 사용하면 DB에서 효율적으로 개수만 가져옵니다.
      _count: {
        select: {
          ingredients: true, // 보관 재료 수
          sharedItems: {
            // 조건부 카운트가 필요하므로 아래에서 별도로 처리하거나
            // 전체를 가져온 뒤 필터링합니다. (여기선 전체 카운트로 예시)
          },
        },
      },
    },
  });

  // 완료된 나눔 건수는 따로 계산 (status가 'completed'인 것만)
  const sharedCount = await prisma.sharedItem.count({
    where: {
      ownerId: (user as any).id, // 세션 ID나 유저 ID 사용
      status: "completed",
    },
  });

  return NextResponse.json({
    ...user,
    ingredientCount: user?._count.ingredients || 0,
    sharedCount: sharedCount || 0,
  });
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. 세션 확인 (로그인 여부)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }

    // 2. 클라이언트가 보낸 데이터 읽기
    const body = await req.json();
    const { location } = body;

    if (typeof location !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 위치 데이터입니다." },
        { status: 400 },
      );
    }

    // 3. DB 업데이트 (Prisma)
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { location: location.trim() },
    });

    return NextResponse.json({
      message: "위치가 성공적으로 업데이트되었습니다.",
      location: updatedUser.location,
    });
  } catch (error) {
    console.error("위치 업데이트 에러:", error);
    return NextResponse.json(
      { error: "서버 내부 에러가 발생했습니다." },
      { status: 500 },
    );
  }
}
