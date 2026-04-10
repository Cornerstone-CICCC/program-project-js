import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ cookies 가져오기

// 1. 재료 목록 가져오기 (GET)
export async function GET() {
  try {
    // ✅ 핵심 수정: cookies() 앞에 await를 붙여야 합니다.
    const cookieStore = await cookies();

    // 이제 .get() 메서드를 정상적으로 사용할 수 있습니다.
    const hasToken =
      cookieStore.get("next-auth.session-token") || cookieStore.get("session");

    // 인증 확인
    const isAuthenticated = !!hasToken;

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    const ingredients = await db.ingredient.findMany({
      orderBy: { expiryDate: "asc" },
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
    // ✅ 핵심 수정: 여기서도 await를 붙여줍니다.
    const cookieStore = await cookies();
    const hasToken =
      cookieStore.get("next-auth.session-token") || cookieStore.get("session");

    if (!hasToken) {
      return NextResponse.json({ error: "권한 없음" }, { status: 401 });
    }

    const body = await req.json();
    const { name, expiryDate } = body;

    const newIngredient = await db.ingredient.create({
      data: {
        name,
        expiryDate: new Date(expiryDate),
        category: "etc",
        location: "fridge",
        quantity: 1.0,
        emoji: "📦",
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: any) {
    console.error("POST 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
