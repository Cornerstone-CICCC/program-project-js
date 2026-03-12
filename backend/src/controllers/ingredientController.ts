import { Request, Response } from "express";
import { Ingredient } from "../models/Ingredient";
import { SharedPost } from "../models/SharedPost";

// @desc    Get my ingredient list
export const getIngredients = async (req: any, res: Response) => {
  try {
    // 최신순으로 정렬해서 보여주는 것이 사용자 입장에서 편합니다.
    const ingredients = await Ingredient.find({ user_id: req.user.id }).sort({
      created_at: -1,
    });
    res.status(200).json(ingredients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve ingredients." });
  }
};

// @desc    Add a new ingredient
export const createIngredient = async (req: any, res: Response) => {
  try {
    const { name, price, store_name, purchased_date, expiration_date } =
      req.body;

    // 필수 필드 검증 (purchased_date 누락 방지)
    if (!name || !purchased_date || !expiration_date) {
      return res.status(400).json({
        message: "Name, purchased date, and expiration date are required.",
      });
    }

    const newIngredient = await Ingredient.create({
      user_id: req.user.id,
      name,
      price: price || 0, // 가격이 없을 경우 0으로 세팅
      store_name,
      purchased_date, // ERD에 추가한 필드
      expiration_date,
    });
    res.status(201).json(newIngredient);
  } catch (error: any) {
    // 에러 발생 시 로그를 찍어주면 디버깅이 훨씬 쉽습니다.
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
