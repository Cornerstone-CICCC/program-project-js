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
    const { ingredient_id, pickup_type, photo_url } = req.body;

    const newPost = await SharedPost.create({
      ingredient_id,
      user_id: req.user.id,
      pickup_type,
      photo_url,
    });

    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: "Failed to create shared post." });
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
