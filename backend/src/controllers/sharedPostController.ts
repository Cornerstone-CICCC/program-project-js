import { Request, Response } from "express";
import { SharedPost } from "../models/SharedPost";
import { Comment } from "../models/Comment"; // 👈 중괄호 확인!
import { Ingredient } from "../models/Ingredient"; // Ingredient 모델 추가

// @desc    Get all available shared posts (with search)
export const getSharedPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = {};

    // 💡 참고: SharedPost에 이름이 직접 없으므로
    // 실제 운영 시에는 Ingredient를 먼저 검색하거나
    // Aggregate를 사용해야 하지만, 일단 기본 구조 유지
    const posts = await SharedPost.find(query)
      .populate({
        path: "ingredient_id",
        match: search ? { name: { $regex: search, $options: "i" } } : {},
      })
      .populate("user_id", "name")
      .sort({ created_at: -1 });

    // populate match로 인해 조건에 안 맞는 ingredient_id가 null이 된 것들을 필터링
    const filteredPosts = posts.filter((post) => post.ingredient_id !== null);

    res.status(200).json(filteredPosts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a shared post
export const createSharedPost = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User authentication failed." });
    }

    const {
      ingredient_id,
      ingredient_name,
      pickup_type,
      photo_url,
      expiration_date,
    } = req.body;
    let finalIngredientId = ingredient_id;

    // 1. 이름으로 들어온 경우 재료 먼저 생성
    if (!finalIngredientId && ingredient_name) {
      const newIngredient = await Ingredient.create({
        user_id: req.user.id,
        name: ingredient_name,
        expiration_date:
          expiration_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        purchased_date: new Date(),
        is_shared: true,
      });
      finalIngredientId = newIngredient._id;
    }

    if (!finalIngredientId || !pickup_type) {
      return res
        .status(400)
        .json({ message: "Ingredient and pickup_type are required." });
    }

    // 2. SharedPost 생성
    const newPost = await SharedPost.create({
      ingredient_id: finalIngredientId,
      user_id: req.user.id,
      pickup_type,
      photo_url: photo_url || "",
      status: "available", // 👈 중요: 모델의 enum과 일치하게 '소문자'로 수정!
    });

    const populatedPost = await SharedPost.findById(newPost._id)
      .populate("ingredient_id")
      .populate("user_id", "name");

    res.status(201).json(populatedPost);
  } catch (error: any) {
    res
      .status(400)
      .json({ message: "Failed to create shared post.", error: error.message });
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
    const { pickup_type, photo_url, status } = req.body;
    let post = await SharedPost.findById(req.params.id);

    if (!post || post.user_id.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized." });
    }

    post = await SharedPost.findByIdAndUpdate(
      req.params.id,
      { pickup_type, photo_url, status },
      { new: true },
    );
    res.status(200).json(post);
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
