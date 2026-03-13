import express from "express";
import {
  getSharedPosts,
  createSharedPost,
  getSharedPostById,
  updateSharedPost,
  updatePostStatus,
  deleteSharedPost,
  addComment, // 👈 추가된 부분
} from "../controllers/sharedPostController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// 1. 조회 (모두 허용)
router.get("/", getSharedPosts);
router.get("/:id", getSharedPostById);

// 2. 작성/수정/삭제 (로그인 필요)
router.post("/", protect, createSharedPost);
router.put("/:id", protect, updateSharedPost); // 전체 수정용
router.patch("/:id", protect, updatePostStatus); // 상태 변경용 (나눔 완료)
router.delete("/:id", protect, deleteSharedPost); // 삭제용

// 3. 댓글 작성 (추가)
router.post("/:id/comments", protect, addComment); // 👈 추가된 부분

export default router;
