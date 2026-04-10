import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. 목록 조회 (GET) - 현재 에러가 발생하는 지점
export async function GET() {
  try {
    const items = await prisma.sharedItem.findMany({
      include: { owner: true },
    });

    // owner 정보가 없는 잘못된 데이터는 필터링해서 에러 방지
    const safeItems = items.filter((item) => item.owner !== null);

    return Response.json(safeItems);
  } catch (error) {
    console.error("SharedItems 로드 에러:", error);
    return Response.json([]); // 에러 시 빈 배열을 반환하여 페이지를 살림
  }
}
