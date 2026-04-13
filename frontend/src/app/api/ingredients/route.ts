import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// 1. 재료 목록 가져오기 (GET)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 },
      );
    }

    // 내 재료만 가져오도록 필터링 추가
    const ingredients = await db.ingredient.findMany({
      where: { userId: session.user.id },
      orderBy: { expiryDate: "asc" },
    });

    return NextResponse.json(ingredients);
  } catch (error) {
    return NextResponse.json({ error: "데이터 로드 실패" }, { status: 500 });
  }
}

// 2. 재료 추가하기 (POST)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "권한 없음" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      expiryDate,
      category,
      emoji,
      quantity,
      unit,
      location,
      memo,
    } = body;

    // ✅ 핵심: 생성할 때 userId를 반드시 넣어줘야 나중에 수정/삭제가 가능합니다.
    const newIngredient = await db.ingredient.create({
      data: {
        name,
        expiryDate: new Date(expiryDate),
        userId: session.user.id, // 유저 ID 연결
        category: category || "etc",
        location: location || "fridge",
        quantity: quantity ? parseFloat(quantity.toString()) : 1.0,
        unit: unit || "개",
        emoji: emoji || "📦",
        memo: memo || "",
      },
    });

    return NextResponse.json(newIngredient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
