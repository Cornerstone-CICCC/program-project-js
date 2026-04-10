import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 🔍 실제 프로젝트의 authOptions 경로로 확인해주세요

// 1. 재료 목록 가져오기 (GET)
export async function GET() {
  try {
    // ✅ 세션을 통해 로그인 정보를 가져옵니다. (쿠키 직접 확인보다 안전함)
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // ✅ 핵심: '내'가 등록한 재료만 필터링해서 가져옵니다.
    const ingredients = await db.ingredient.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("GET 에러:", error);
    return NextResponse.json({ error: "데이터 로드 실패" }, { status: 500 });
  }
}

// 2. 재료 추가하기 (POST)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { name, expiryDate } = body;

    // ✅ 하드코딩된 ID 대신 session.user.id를 할당합니다.
    const newIngredient = await db.ingredient.create({
      data: {
        name,
        expiryDate: new Date(expiryDate),
        category: "etc",
        location: "fridge",
        quantity: 1.0,
        emoji: "📦",
        userId: session.user.id, // 🔍 유저 ID 자동 연동
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: any) {
    console.error("POST 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
