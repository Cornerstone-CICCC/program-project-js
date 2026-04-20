import { ai } from "@/lib/gemini"; // ai 인스턴스를 가져옵니다.
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { itemName, type } = await req.json();
    const promptText = `
      Create a professional ${type === "recipe" ? "cooking recipe" : "food recommendation"} 
      using "${itemName}" as the primary ingredient. 
      
      Requirements:
      1. Respond strictly in English.
      2. Do not include any Korean characters or translations.
      3. Focus on a gourmet, high-end culinary perspective.
    `;

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
    console.error("Gemini 3 API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
