import express from "express";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notificationController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.use(protect); // 모든 알림 기능은 로그인이 필요함

router.get("/", getMyNotifications);
router.patch("/:id", markAsRead);

export default router;
