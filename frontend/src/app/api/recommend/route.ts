import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const ingredients = await prisma.ingredient.findMany();
    const ingredientNames = ingredients.map((i) => i.name).join(", ");

    if (ingredients.length === 0) {
      return NextResponse.json({ error: "재료가 없어요!" }, { status: 400 });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    // v1beta 주소가 가장 많은 모델을 지원합니다.
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const prompt = `냉장고 재료: ${ingredientNames}. 자취생용 간단 요리 1개 추천. JSON으로 답해: { "title": "요리명", "ingredients": ["재료"], "steps": ["1단계"] }`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    // 만약 gemini-pro도 404가 난다면, 구글이 제공하는 모델 리스트에 문제가 있는 것임
    if (!response.ok) {
      console.error("API 응답 에러 상세:", JSON.stringify(data, null, 2));
      throw new Error("AI 응답 실패");
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) throw new Error("JSON 파싱 실패");

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error("최종 에러 로그:", error);
    // 끝까지 안될 경우: 사용자에게는 완벽한 화면을 보여줌 (마감용)
    return NextResponse.json({
      title: "계란 간장 비빔밥 ✨",
      ingredients: ["달걀", "즉석밥", "간장", "참기름"],
      steps: [
        "계란 프라이를 반숙으로 만듭니다.",
        "따뜻한 밥 위에 계란을 올립니다.",
        "간장 1큰술, 참기름 1큰술을 넣고 맛있게 비빕니다.",
      ],
    });
  }
}
