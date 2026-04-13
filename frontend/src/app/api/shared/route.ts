import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.sharedItem.findMany({
      where: {
        // 1. 유효한 작성자가 있는 것만 필터링
        userId: { not: "" },
        // 2. 관계 데이터의 무결성 확인 (주인 없는 데이터 방지)
        owner: {
          is: {
            id: { not: "" },
          },
        },
      },
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("SharedItems 로드 에러:", error);
    // 에러 발생 시 프론트엔드가 터지지 않도록 빈 배열 반환
    return NextResponse.json([]);
  }
}
