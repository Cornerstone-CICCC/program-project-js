import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 1. 목록 조회 (GET) - 현재 에러가 발생하는 지점
export async function GET() {
  try {
    const items = await prisma.sharedItem.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        // ✅ 모델에 맞춰 Int로 처리 (String?일 경우에도 문제 없음)
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
    console.error("❌ API GET Error (List):", error);
    return NextResponse.json(
      { error: "데이터 목록을 가져오는데 실패했습니다." },
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
        category: body.category || "Food",
        status: body.status || "free",
        // ✅ 프론트에서 넘어온 값을 숫자로 변환 (모델이 Int일 경우 필수)
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
        error: "등록 실패",
        details: error instanceof Error ? error.message : "Internal Error",
      },
      { status: 500 },
    );
  }
}
