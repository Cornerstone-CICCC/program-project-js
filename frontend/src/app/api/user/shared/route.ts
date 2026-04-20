import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  // 1. 현재 로그인한 사람이 누구인지 확인 (세션)
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Authentication is required." },
      { status: 401 },
    );
  }

  try {
    // 2. 이메일로 DB에서 내 유저 정보(ID)를 가져옴
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // 3. ownerId가 '내 ID'인 데이터만 필터링해서 가져옴
    const myItems = await prisma.sharedItem.findMany({
      where: {
        userId: user.id, // ← 이 부분이 핵심! 남의 것은 안 가져옵니다.
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(myItems);
  } catch (error) {
    console.error("My shared items load error:", error);
    return NextResponse.json([]);
  }
}
