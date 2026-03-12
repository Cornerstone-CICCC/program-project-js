import { Request, Response } from "express";
import { SharedPost } from "../models/SharedPost";

// @desc    Get all available shared posts
// @route   GET /api/shared-posts
export const getSharedPosts = async (req: Request, res: Response) => {
  try {
    // status가 available인 것만 가져오고, 재료와 유저 정보를 합침(Populate)
    const posts = await SharedPost.find({ status: "available" })
      .populate("ingredient_id")
      .populate("user_id", "name"); // 유저의 이름만 가져옴

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shared posts." });
  }
};

// @desc    Create a shared post
// @route   POST /api/shared-posts
export const createSharedPost = async (req: any, res: Response) => {
  try {
    // 1. 유저 정보가 있는지 확실히 체크 (null 방지)
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "User authentication failed. Please login again." });
    }

    const { ingredient_id, pickup_type, photo_url } = req.body;

    // 2. 필수 필드 체크
    if (!ingredient_id || !pickup_type) {
      return res
        .status(400)
        .json({ message: "ingredient_id and pickup_type are required." });
    }

    // 3. 데이터 생성
    const newPost = await SharedPost.create({
      ingredient_id,
      user_id: req.user.id, // 토큰에서 추출한 ID를 확실히 할당
      pickup_type,
      photo_url,
    });

    // 4. 생성된 데이터를 바로 보내주기 전에 유저 정보를 합쳐서(populate) 응답하면 프론트엔드가 편해요.
    const populatedPost = await SharedPost.findById(newPost._id)
      .populate("ingredient_id")
      .populate("user_id", "name");

    res.status(201).json(populatedPost);
  } catch (error: any) {
    console.error("🚨 Create Post Error:", error.message);
    res
      .status(400)
      .json({ message: "Failed to create shared post.", error: error.message });
  }
};

// @desc    Get single shared post detail
// @route   GET /api/shared-posts/:id
export const getSharedPostById = async (req: Request, res: Response) => {
  try {
    const post = await SharedPost.findById(req.params.id)
      .populate("ingredient_id")
      .populate("user_id", "name email");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ message: "Invalid post ID." });
  }
};

// @desc    Update post status (e.g., mark as completed)
// @route   PATCH /api/shared-posts/:id
export const updatePostStatus = async (req: Request, res: Response) => {
  try {
    const updatedPost = await SharedPost.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: "Failed to update post status." });
  }
};
