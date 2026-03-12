import { Request, Response } from "express";
import { Ingredient } from "../models/Ingredient";
import { SharedPost } from "../models/SharedPost";

const autoCategorize = (name: string): string => {
  const map: { [key: string]: string[] } = {
    Meat: [
      "소",
      "돼지",
      "닭",
      "고기",
      "beef",
      "pork",
      "chicken",
      "삼겹살",
      "스테이크",
    ],
    Seafood: [
      "연어",
      "새우",
      "생선",
      "고등어",
      "오징어",
      "salmon",
      "shrimp",
      "fish",
    ],
    Vegetable: [
      "양파",
      "당근",
      "마늘",
      "배추",
      "감자",
      "onion",
      "garlic",
      "carrot",
    ],
    Dairy: ["우유", "치즈", "버터", "요거트", "milk", "cheese", "butter"],
    Fruit: ["사과", "바나나", "포도", "딸기", "apple", "banana", "berry"],
  };

  for (const [cat, keywords] of Object.entries(map)) {
    if (keywords.some((k) => name.toLowerCase().includes(k))) return cat;
  }
  return "General"; // 매칭되지 않을 경우 기본값
};

// @desc    Get my ingredient list
export const getIngredients = async (req: any, res: Response) => {
  try {
    const ingredients = await Ingredient.find({ user_id: req.user.id }).sort({
      expiration_date: 1, // 유통기한이 임박한 순서대로 정렬하는 것이 더 전략적입니다.
    });
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve ingredients." });
  }
};

/**
 * [추가] 유통기한 임박 알림 조회 (오늘 기준 3일 이내)
 * @route GET /api/ingredients/alerts
 */
export const getExpiryAlerts = async (req: any, res: Response) => {
  try {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    const alerts = await Ingredient.find({
      user_id: req.user.id,
      expiration_date: {
        $gte: today, // 오늘부터
        $lte: threeDaysLater, // 3일 후까지
      },
    }).sort({ expiration_date: 1 });

    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expiry alerts." });
  }
};

// @desc    Add a new ingredient (with Auto-Categorization)
export const createIngredient = async (req: any, res: Response) => {
  try {
    const { name, price, store_name, purchased_date, expiration_date } =
      req.body;

    if (!name || !purchased_date || !expiration_date) {
      return res.status(400).json({
        message: "Name, purchased date, and expiration date are required.",
      });
    }

    // [핵심] 저장 시 자동으로 카테고리 할당
    const category = autoCategorize(name);

    const newIngredient = await Ingredient.create({
      user_id: req.user.id,
      name,
      category, // 고도화 필드
      price: price || 0,
      store_name,
      purchased_date,
      expiration_date,
    });
    res.status(201).json(newIngredient);
  } catch (error: any) {
    console.error("Create Error:", error.message);
    res
      .status(400)
      .json({ message: "Invalid data format.", error: error.message });
  }
};

// @desc    Update an ingredient
export const updateIngredient = async (req: Request, res: Response) => {
  try {
    // req.body에 purchased_date가 포함되어도 findByIdAndUpdate가 알아서 처리합니다.
    const updated = await Ingredient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }, // runValidators를 추가해야 수정 시에도 모델 제약조건을 체크합니다.
    );

    if (!updated) {
      return res.status(404).json({ message: "Ingredient not found." });
    }

    res.status(200).json(updated);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to update ingredient.", error: error.message });
  }
};

// @desc    Delete an ingredient
export const deleteIngredient = async (req: Request, res: Response) => {
  try {
    const deleted = await Ingredient.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Ingredient not found." });
    }
    res.status(200).json({ message: "Ingredient deleted successfully." });
  } catch (error) {
    res.status(400).json({ message: "Failed to delete ingredient." });
  }
};

// @desc    Update post status (e.g., mark as completed)
// @route   PATCH /api/shared-posts/:id
export const updatePostStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;

    // 1. 유효한 상태 값인지 확인 (available, completed, canceled)
    const validStatuses = ["available", "completed", "canceled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // 2. 게시글 찾기
    const post = await SharedPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 3. 작성자 본인 확인 (내 글만 내가 완료할 수 있음)
    if (post.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this post." });
    }

    // 4. 상태 업데이트
    post.status = status;
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: "Failed to update post status." });
  }
};
