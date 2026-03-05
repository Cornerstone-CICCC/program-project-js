import express from "express";
import {
  getSharedPosts,
  createSharedPost,
  getSharedPostById,
  updatePostStatus,
} from "../controllers/sharedPostController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// 게시판 조회는 로그인 안 해도 볼 수 있게 할지, 로그인 필수일지 결정 가능 (여기서는 전체 공개)
router.get("/", getSharedPosts);
router.get("/:id", getSharedPostById);

// 게시글 작성 및 상태 수정은 로그인 필수
router.post("/", protect, createSharedPost);
router.patch("/:id", protect, updatePostStatus);

export default router;
