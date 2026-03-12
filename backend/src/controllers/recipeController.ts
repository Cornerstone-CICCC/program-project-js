import { Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { RecipeLog } from "../models/RecipeLog";
import { Ingredient } from "../models/Ingredient";
import dotenv from "dotenv";

dotenv.config();

// @desc    AI를 사용해 레시피 생성 및 자동 저장
// @route   POST /api/recipes/generate
export const generateAiRecipe = async (req: any, res: Response) => {
  try {
    const { ingredient_ids } = req.body;

    const selectedIngredients = await Ingredient.find({
      _id: { $in: ingredient_ids },
      user_id: req.user.id,
    });

    if (selectedIngredients.length === 0) {
      return res.status(400).json({ message: "선택된 재료가 없습니다." });
    }

    const ingredientNames = selectedIngredients
      .map((ing) => ing.name)
      .join(", ");

    // 1. API 키 확인 (설정한 GOOGLE_API_KEY 사용)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("API 키가 설정되지 않았습니다. .env 파일을 확인하세요.");
    }

    // 2. 구글 API 호출 (캐나다 표준 엔드포인트)
    const fetch = require("node-fetch");
    const prompt = `${ingredientNames}를 활용한 요리 레시피 1개를 추천해줘. '요리 이름', '추가 재료', '조리 순서' 순서로 한국어로 작성해줘.`;

    // [핵심] 주소 형식을 아래와 정확히 일치시켜야 합니다.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await response.json();

    // 3. 에러 발생 시 터미널 로그 확인용
    if (data.error) {
      console.error(
        "🔥 구글 API 에러 발생:",
        JSON.stringify(data.error, null, 2),
      );
      return res.status(data.error.code || 500).json({
        message: "AI 서비스 응답 에러",
        error: data.error.message,
      });
    }

    const recipeText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!recipeText) {
      throw new Error("AI로부터 레시피를 가져오지 못했습니다.");
    }

    // 4. DB 저장 및 응답
    const newLog = await RecipeLog.create({
      user_id: req.user.id,
      ingredients_used: ingredientNames,
      generated_recipe: recipeText,
    });

    res.status(201).json(newLog);
  } catch (error: any) {
    console.error("❌ 최종 컨트롤러 에러:", error.message);
    res.status(500).json({
      message: "레시피 생성 실패",
      error: error.message,
    });
  }
};

// --- 나머지 saveRecipeLog, getMyRecipeLogs 함수는 그대로 유지 ---
export const saveRecipeLog = async (req: any, res: Response) => {
  try {
    const { ingredients_used, generated_recipe } = req.body;
    const newLog = await RecipeLog.create({
      user_id: req.user.id,
      ingredients_used,
      generated_recipe,
    });
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: "Failed to save recipe log." });
  }
};

export const getMyRecipeLogs = async (req: any, res: Response) => {
  try {
    const logs = await RecipeLog.find({ user_id: req.user.id }).sort({
      created_at: -1,
    });
    res.status(200).json(logs);
  } catch (error) {
    res.status(400).json({ message: "Failed to fetch recipe logs." });
  }
};
