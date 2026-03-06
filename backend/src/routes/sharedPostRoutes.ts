import express from "express";
import {
  getSharedPosts,
  createSharedPost,
  getSharedPostById,
  updatePostStatus,
} from "../controllers/sharedPostController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", getSharedPosts);
router.get("/:id", getSharedPostById);

router.post("/", protect, createSharedPost);
router.patch("/:id", protect, updatePostStatus);

export default router;
