import express from "express";
import multer from "multer"; // 1. multer 임포트
import {
  getSharedPosts,
  createSharedPost,
  getSharedPostById,
  updateSharedPost,
  updatePostStatus,
  deleteSharedPost,
  addComment,
  getMySharedPosts,
} from "../controllers/sharedPostController";
import { protect } from "../middlewares/authMiddleware";

// 2. multer 설정 (메모리에 임시 저장하거나 경로 설정 가능)
const upload = multer();
const router = express.Router();

router.get("/", getSharedPosts);
router.get("/my/posts", protect, getMySharedPosts);
router.get("/:id", getSharedPostById);

// 3. 🔴 여기 중요! upload.any() 또는 .single("image")를 추가합니다.
router.post("/", protect, upload.any(), createSharedPost);
router.put("/:id", protect, upload.any(), updateSharedPost);

router.patch("/:id", protect, updatePostStatus);
router.delete("/:id", protect, deleteSharedPost);
router.post("/:id/comments", protect, addComment);

export default router;
