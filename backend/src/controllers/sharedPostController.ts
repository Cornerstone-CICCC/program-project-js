import { Request, Response } from "express";
import { SharedPost } from "../models/SharedPost";
import { Comment } from "../models/Comment"; // 👈 중괄호 확인!

// @desc    Get all available shared posts (with search)
export const getSharedPosts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query: any = { status: "available" };

    const posts = await SharedPost.find(query)
      .populate("ingredient_id")
      .populate("user_id", "name");

    if (search) {
      const filteredPosts = posts.filter((post: any) => {
        return (
          post.ingredient_id &&
          post.ingredient_id.name
            .toLowerCase()
            .includes((search as string).toLowerCase())
        );
      });
      return res.status(200).json(filteredPosts);
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shared posts." });
  }
};

// @desc    Create a shared post
export const createSharedPost = async (req: any, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "User authentication failed." });
    }

    const { ingredient_id, pickup_type, photo_url } = req.body;

    if (!ingredient_id || !pickup_type) {
      return res
        .status(400)
        .json({ message: "ingredient_id and pickup_type are required." });
    }

    const newPost = await SharedPost.create({
      ingredient_id,
      user_id: req.user.id,
      pickup_type,
      photo_url,
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
