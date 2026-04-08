import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prisma 클라이언트 인스턴스 생성
const prisma = new PrismaClient();

// 1. 데이터 조회 (GET)
export async function GET() {
  try {
    const items = await prisma.sharedItem.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        quantity: true,
        description: true,
        expiryDate: true,
        lat: true,
        lng: true,
        userId: true,
        imageUrl: true,
        category: true,
        availabilityStatus: true,
        createdAt: true,
        owner: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("❌ API GET Error:", error);
    return NextResponse.json(
      { error: "데이터를 가져오는데 실패했습니다." },
      { status: 500 },
    );
  }
}

// 2. 데이터 등록 (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newItem = await prisma.sharedItem.create({
      data: {
        name: body.name,
        // ✅ 해결: category가 없으면 기본값 "Food" 또는 body에서 받은 값 사용
        category: body.category || "Etc",
        status: body.status || "free",
        // DB 모델이 String? 이므로 문자열로 변환
        quantity: body.quantity ? Number(body.quantity) : 1,
        description: body.description || "",
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : new Date(),
        lat: parseFloat(body.lat) || 49.2827,
        lng: parseFloat(body.lng) || -123.1207,
        userId: body.userId,
        availabilityStatus: "available",
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("❌ API POST Error:", error);
    return NextResponse.json(
      {
        error: "아이템 등록에 실패했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
