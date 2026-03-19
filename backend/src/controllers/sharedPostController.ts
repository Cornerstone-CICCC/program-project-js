import { Request, Response } from "express";
import { SharedPost } from "../models/SharedPost";
import { Comment } from "../models/Comment"; // 👈 중괄호 확인!
import { Ingredient } from "../models/Ingredient"; // Ingredient 모델 추가

// 헬퍼 함수: 권한 체크를 안전하게 수행
const isOwner = (post: any, req: any) => {
  const userId = req.user?._id?.toString() || req.user?.id?.toString();
  return post.user_id.toString() === userId;
};

// @desc    Get all available shared posts (with search)
export const getSharedPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const posts = await SharedPost.find()
      .populate({
        path: "ingredient_id",
        match: search ? { name: { $regex: search, $options: "i" } } : {},
      })
      .populate("user_id", "name")
      .sort({ created_at: -1 });

    const filteredPosts = posts.filter((post) => post.ingredient_id !== null);
    res.status(200).json(filteredPosts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a shared post
export const createSharedPost = async (req: any, res: Response) => {
  try {
    // 1. 유저 정보 확인 로직
    console.log("요청 유저 정보:", req.user);
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "로그인 정보가 없습니다." });
    }

    const {
      ingredient_id,
      ingredient_name,
      pickup_type,
      photo_url,
      expiration_date,
      description,
    } = req.body;

    // 2. 🟢 finalIngredientId 정의 로직 추가
    let finalIngredientId = ingredient_id;

    // 만약 기존 재료 ID가 없고 이름만 들어온 경우, 새로운 Ingredient 생성
    if (!finalIngredientId && ingredient_name) {
      const newIngredient = await Ingredient.create({
        user_id: userId,
        name: ingredient_name,
        expiration_date:
          expiration_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        purchased_date: new Date(),
        is_shared: true,
      });
      finalIngredientId = newIngredient._id;
    }

    // 3. SharedPost 생성
    const newPost = await SharedPost.create({
      ingredient_id: finalIngredientId,
      user_id: userId,
      pickup_type,
      description: description || "",
      ingredient_name: ingredient_name || "",
      photo_url: photo_url || "",
      status: "available",
    });

    // 4. 결과 반환 (이름 등을 함께 가져오기 위해 populate)
    const populatedPost = await SharedPost.findById(newPost._id)
      .populate("ingredient_id")
      .populate("user_id", "name");

    res.status(201).json(populatedPost);
  } catch (error: any) {
    console.error("Create SharedPost Error:", error);
    res.status(400).json({
      message: "Failed to create shared post.",
      error: error.message,
    });
  }
};

// @desc    Get single shared post detail with comments
export const getSharedPostById = async (req: Request, res: Response) => {
  try {
    const post = await SharedPost.findById(req.params.id)
      .populate("ingredient_id")
      .populate("user_id", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // 💡 에러 해결 포인트: Comment as any를 사용하거나 import 확인
    const comments = await (Comment as any)
      .find({ post_id: req.params.id })
      .populate("user_id", "name")
      .sort({ created_at: -1 });

    res.status(200).json({ post, comments });
  } catch (error) {
    res.status(400).json({ message: "Invalid post ID." });
  }
};

// @desc    Add a comment to a post (누락되었던 기능 추가)
export const addComment = async (req: any, res: Response) => {
  try {
    const { content } = req.body;
    const newComment = await Comment.create({
      post_id: req.params.id,
      user_id: req.user.id,
      content,
    });
    const populatedComment = await Comment.findById(newComment._id).populate(
      "user_id",
      "name",
    );
    res.status(201).json(populatedComment);
  } catch (error: any) {
    res.status(400).json({ message: "Failed to add comment." });
  }
};

// @desc    Update post status
export const updatePostStatus = async (req: any, res: Response) => {
  try {
    const post = await SharedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (post.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized." });
    }

    post.status = req.body.status || post.status;
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: "Update status failed." });
  }
};

// @desc    Update a shared post (Full update)
export const updateSharedPost = async (req: any, res: Response) => {
  try {
    const post = await SharedPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });

    if (!isOwner(post, req)) {
      return res.status(401).json({ message: "Not authorized." });
    }

    // 💡 모든 필드를 업데이트 대상에 포함
    const updatedPost = await SharedPost.findByIdAndUpdate(
      req.params.id,
      {
        pickup_type: req.body.pickup_type || post.pickup_type,
        photo_url: req.body.photo_url || post.photo_url,
        status: req.body.status || post.status,
        description: req.body.description || post.description,
        ingredient_name: req.body.ingredient_name || post.ingredient_name,
      },
      { new: true },
    );
    res.status(200).json(updatedPost);
  } catch (error: any) {
    res.status(400).json({ message: "Update failed." });
  }
};

// @desc    Delete a shared post
export const deleteSharedPost = async (req: any, res: Response) => {
  try {
    const post = await SharedPost.findById(req.params.id);
    if (!post || post.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post removed." });
  } catch (error: any) {
    res.status(500).json({ message: "Delete failed." });
  }
};

export const getMySharedPosts = async (req: any, res: any) => {
  try {
    const myPosts = await SharedPost.find({ user_id: req.user.id })
      .populate("user_id", "name")
      .sort({ created_at: -1 });
    res.json(myPosts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
