import { ai } from "@/lib/gemini"; // ai 인스턴스를 가져옵니다.
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { itemName, type } = await req.json();
    const promptText = `${itemName}을(를) 활용한 ${type === "recipe" ? "요리 레시피" : "음식 추천"}를 알려줘.`;

    // 🔍 1. 모델을 가져올 때 await를 붙여서 Promise를 해결합니다.
    const geminiModel = await ai.models.get({
      model: "gemini-3-flash-preview",
    });

    // 🔍 2. 이제 geminiModel에서 generateContent를 호출할 수 있습니다.
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: promptText }] }],
    });

    return NextResponse.json({ suggestion: result.text });
  } catch (error: any) {
    console.error("Gemini 3 API 에러:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
