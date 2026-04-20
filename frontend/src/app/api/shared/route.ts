import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 1. 나눔 목록 가져오기 (GET)
export async function GET() {
  try {
    const items = await prisma.sharedItem.findMany({
      include: {
        owner: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 작성자(owner) 정보가 정상적으로 연결된 데이터만 필터링
    const validItems = items.filter((item) => item.owner !== null);

    return NextResponse.json(validItems);
  } catch (error: any) {
    console.error("SharedItems Load Error:", error);
    return NextResponse.json([]);
  }
}

// 2. 새로운 나눔 등록하기 (POST) - 이 부분이 추가되어야 405 에러가 해결됩니다!
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 인증 확인
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Login is required." },
        { status: 401 },
      );
    }

    const data = await req.json();
    const {
      name,
      description,
      status,
      quantity,
      expiryDate,
      lat,
      lng,
      imageUrl,
      category,
    } = data;

    // 유저 조회
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // DB 저장
    const newItem = await prisma.sharedItem.create({
      data: {
        name,
        description: description || "",
        status: status || "free",
        quantity: Number(quantity) || 1,
        expiryDate: new Date(expiryDate), // ISO 문자열을 Date 객체로 변환
        lat: parseFloat(lat) || 0,
        lng: parseFloat(lng) || 0,
        imageUrl: imageUrl || "",
        category: category || "Food",
        userId: user.id, // User 모델과의 관계 연결
      },
    });

    return NextResponse.json(newItem);
  } catch (error: any) {
    console.error("Sharing creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred.", details: error.message },
      { status: 500 },
    );
  }
}
