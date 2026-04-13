// app/api/user/me/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // authOptions 경로 확인
import prisma from "@/lib/prisma"; // prisma 인스턴스 경로 확인

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "인증되지 않은 사용자입니다." },
      { status: 401 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      level: true,
      rating: true,
      location: true,
      ingredients: { select: { id: true } }, // 보관 재료 수 계산용
      sharedItems: { where: { status: "completed" } }, // 나눔 완료 수 계산용
    },
  });

  return NextResponse.json(user);
}
