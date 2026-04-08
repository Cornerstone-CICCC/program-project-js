import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 재료 목록 가져오기 (GET)
export async function GET() {
  try {
    const ingredients = await db.ingredient.findMany({
      orderBy: { expiryDate: "asc" }, // 유통기한 순으로 정렬
    });
    return NextResponse.json(ingredients);
  } catch (error) {
    console.error("GET 에러:", error);
    return NextResponse.json({ error: "데이터 로드 실패" }, { status: 500 });
  }
}

// 재료 추가하기 (POST)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, expiryDate } = body;

    if (!name || !expiryDate) {
      return NextResponse.json(
        { error: "이름과 날짜를 입력하세요." },
        { status: 400 },
      );
    }

    const newIngredient = await db.ingredient.create({
      data: {
        name: name,
        expiryDate: new Date(expiryDate),
        // 👇 필수 필드들을 채워줍니다.
        category: "etc", // 기본 카테고리
        location: "fridge", // 기본 위치
        quantity: 1.0,
        emoji: "📦",
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: any) {
    console.error("POST 상세 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
