import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_GEMINI_API_KEY가 설정되지 않았습니다.");
}

export const ai = new GoogleGenAI({ apiKey });

// 🔍 "string"이 아니라 객체 { model: "..." } 형태로 전달해야 합니다.
export const geminiModel = ai.models.get({
  model: "gemini-3-flash-preview",
});
